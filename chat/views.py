from django.shortcuts import render , get_object_or_404 , redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse , HttpResponseBadRequest , HttpResponseServerError
from django.db.models import Q 
from django.views.decorators.csrf import csrf_exempt

from .utils import get_or_create_private_room as utils_get_or_create_private_room, get_private_room
from .models import GroupRoom , ChatUser  , PrivateRoom
from .forms import ProfileForm

# Create your views here.
User = get_user_model()

@login_required
def home(request):
    user = User.objects.get(username=request.user.username)
    context = {
    }
    return render(request,'chat/home.html',context)


@login_required
def settings(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.chatuser)
        if form.is_valid():
            # Check if the user chose a new profile photo
            if not request.FILES.get('profile_photo'):
                # If no new photo is chosen, use the existing value
                form.cleaned_data['profile_photo'] = request.user.chatuser.profile_photo

            form.save()
            return redirect('chat:settings')  # Redirect to the profile page or any other desired page
    else:
        form = ProfileForm(instance=request.user.chatuser)

    context = {}
    return render(request,'chat/settings.html',context)

@login_required 
def profile(request , username):
    user = User.objects.get(username=username)
    context = {
        'user_object':user.chatuser
    }
    return render(request,'chat/profile.html',context)

@login_required
def group_detail(request,group_id):
    group = get_object_or_404(GroupRoom , id=group_id)
    member_count = group.members.count()
    context = {'group':group,'member_count':member_count}
    return render(request, 'chat/group_detail.html',context)
    

@login_required
def group_edit(request , group_id):
    group = get_object_or_404(GroupRoom , id=group_id)
    if request.user not in group.admins:
        return HttpResponseBadRequest('Permission Denied')
    context = {}
    return render(request, 'chat/group_edit.html',context)



def search(request):
    query = request.GET.get('q', '')
    users = [{'id':user.id,'name': user.username, 'type': 'user','profile_photo':user.chatuser.profile_photo.url} for user in User.objects.filter(username__icontains=query)]
    groups = [{'id':group.id,'name': group.name, 'type': 'group','logo':group.logo.url} for group in GroupRoom.objects.filter(name__icontains=query)]

    results = users + groups
    return JsonResponse(results, safe=False)


@login_required
def get_my_rooms(request):
    user = request.user
    private_rooms = PrivateRoom.objects.filter(Q(user1=user) | Q(user2=user))

    private_rooms_users = []
    for room in private_rooms:
        other_user = room.user2 if user == room.user1 else room.user1
        private_rooms_users.append(other_user)

    users = [{'name': user.username, 'type': 'user','profile_photo':user.chatuser.profile_photo.url,'id':user.id} for user in private_rooms_users]
    groups = [{'name': group.name, 'type': 'group','logo':group.logo.url,'id':group.id} for group in GroupRoom.objects.filter(members=user)]

    room_list = users + groups  
    room_count = len(room_list)
    my_rooms = {
        'room_list':room_list,
        'room_count':room_count
    }
    return JsonResponse(my_rooms)

@login_required
def get_private_chat(request,user_id):
    try:
        user2 = User.objects.get(id=user_id)

        room = get_private_room(request.user, user2)
        if not room: 
            messages = []
            room_id = None
        else:
            messages = room.messages.all()
            room_id = str(room.id)

        context = {
            'room_id': room_id,
            'messages': [
                {
                    'id': str(message.id),
                    'content': message.content,
                    'created_at': message.created_at.isoformat(),
                    'sender':message.sender.username,
                }
                for message in messages
            ],
            'receiver': user2.username,
            'receiver_id':user2.id,
            'profile_photo':user2.chatuser.profile_photo.url,
            'private_room':True
        }

        return JsonResponse(context)
    except User.DoesNotExist:
        return HttpResponseBadRequest('User not found')
    except Exception as e:
        return HttpResponseServerError(f'Server error: {str(e)}')

@login_required
def get_or_create_private_room(request,user_id):
    try : 
        user2 = User.objects.get(id=user_id)
        room = utils_get_or_create_private_room(request.user ,user2)
        response = {
            'room_id':room.id,
            'users':[room.user1.username,room.user2.username]
        }
        return JsonResponse(response)

    except:
        return HttpResponseBadRequest('User not found')


@login_required
def get_group_chat(request,room_id):
    
    try:
        room = GroupRoom.objects.get(id=room_id)
        messages = room.messages.all()

        context = {
            'room_id': str(room.id),
            'room_name':room.name,
            'messages': [
                {
                    'id': str(message.id),
                    'content': message.content,
                    'created_at': message.created_at.isoformat(),
                    'sender':message.sender.username,
                }
                for message in messages
            ],
            'logo':room.logo.url,
            'private_room':False
        }

        return JsonResponse(context)
    
    except GroupRoom.DoesNotExist:
        return HttpResponseBadRequest(f'Group with ID {room.id} not found.')
    except Exception as e: 
        return HttpResponseServerError(f'Server error: {str(e)}')
    
@login_required
@csrf_exempt
def create_group(request):
    if request.method=='POST':
        try:
            group_name = request.POST.get('group_name')
            members = request.POST.getlist('group_members[]',[])
            creator = request.user 
            admins = [creator]
            
            group_room = GroupRoom.objects.create(name=group_name,creator=creator)
            group_room.admins.set(admins)
            group_room.members.set(members)

            response_data = {
                'id': str(group_room.id),
                'name': group_room.name,
                'logo': group_room.logo.url if group_room.logo else '',
                'creator': group_room.creator.username,
                'admins': [admin.username for admin in group_room.admins.all()],
                'members': [member_name for member_name in group_room.members.values_list('username', flat=True)],
                'created_at': group_room.created_at.isoformat(),
            }

            return JsonResponse(response_data, status=201)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

def get_my_friends(request):
    user = request.user
    private_rooms = PrivateRoom.objects.filter(Q(user1=user) | Q(user2=user))

    friends = []
    for room in private_rooms:
        other_user = room.user2 if user == room.user1 else room.user1
        friends.append(other_user)
    

    response = {
        'friends':[{'user_id':friend.id,'username':friend.username,'profile_photo':friend.chatuser.profile_photo.url} for friend in friends]
    }
    return JsonResponse(response)
