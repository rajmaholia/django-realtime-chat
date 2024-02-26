from django.shortcuts import render , get_object_or_404 , redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse , HttpResponseBadRequest , HttpResponseServerError
from django.db.models import Q 
from django.views.decorators.csrf import csrf_exempt
from django.utils.html import escape

import json 

from .utils import get_or_create_private_room as utils_get_or_create_private_room, get_private_room
from .models import GroupRoom , ChatUser  , PrivateRoom
from .forms import ProfileForm , GroupRoomForm

    
# Create your views here.
User = get_user_model()

@login_required
def home(request,**args):
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
        'user_object':user,
        'friends':user.chatuser.friends.all()
    }
    return render(request,'chat/profile.html',context)

@login_required
def group_detail(request,group_id):
    group = get_object_or_404(GroupRoom , id=group_id)
    member_count = group.members.count()
    context = {'group':group,'member_count':member_count}
    return render(request, 'chat/group_detail.html',context)
    
# views.py
@login_required
@csrf_exempt
def group_edit(request, group_id):
    group = get_object_or_404(GroupRoom, id=group_id)
    if request.user not in group.admins.all():
        return HttpResponseBadRequest('Permission Denied')
    
    context = {'group': group}
    return render(request, 'chat/group_edit.html', context)



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
        room , created = utils_get_or_create_private_room(request.user ,user2)
        if created:
            user2.chatuser.friends.add(request.user)
            request.user.chatuser.friends.add(user2)
        response = {
            'room_id':room.id,
            'users':[room.user1.username,room.user2.username]
        }
        return JsonResponse(response)

    except User.DoesNotExist:
        return HttpResponseBadRequest('User not found')
    except Exception as e:
        return HttpResponseServerError(f'Server error: {str(e)}')
    


@login_required
def get_group_chat(request,room_id):
    
    try:
        room = GroupRoom.objects.get(id=room_id)
        messages = room.messages.all()
        is_member = True if request.user in room.members.all() else False
        context = {
            'room_id': str(room.id),
            'room_type':'group',
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
            'private_room':False,
            'is_member':is_member,
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
            group_name = escape(request.POST.get('group_name'))
            members = request.POST.getlist('group_members[]',[])
            creator = request.user 
            admins = [creator]

            errors = {}
            if len(group_name.strip()) == 0:
                errors['group_name'] = 'This field is required'
            if len(members) == 0:
                errors['group_members'] = 'Add at least one member'
            if len(errors) != 0:
                return JsonResponse({'errors':errors},status=400)
            
            group_room = GroupRoom.objects.create(name=group_name,creator=creator)
            group_room.admins.set(admins)
            group_room.members.set(members+admins)

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

@login_required
@csrf_exempt
def join_group(request):

    if request.method=="POST":
        try:
            group_id = request.POST.get('group_id')
            user = request.user 
            group = GroupRoom.objects.get(id=group_id)
            group.members.add(user)
            return JsonResponse({'status':'success','message':f'you joined the group ID:{group_id} , NAME:{group.name}'})
        
        except GroupRoom.DoesNotExist:
            return HttpResponseBadRequest('Group doesn\'t exists')
        
        except Exception as e:
            return HttpResponseServerError('Internal Server Error : '+str(e))

    else:
        return HttpResponseBadRequest('Invalid request !')
        

@login_required
@csrf_exempt
def edit_group_api(request,group_id):
    try:
        group = GroupRoom.objects.get(id=group_id)
        if request.method == 'POST':
            form = GroupRoomForm(request.POST,request.FILES,group)
            if form.is_valid():
                cleaned_data = form.cleaned_data
                group.name = cleaned_data['name']
                group.description = cleaned_data['description']
                group.logo = cleaned_data['logo']
                group.members.set(cleaned_data['members'])
                group.admins.set(cleaned_data['admins'])
                group.save()
            else:
                errors_json = form.errors.as_json()
                errors = json.loads(errors_json)
                return JsonResponse({'errors':errors})
        
            return JsonResponse({'status':'success'})
            
            
        else:
            group_admins = group.admins.all()
            response = {
                'group':{
                    'logo':group.logo.url,
                    'name':group.name,
                    'description':group.description,
                    'members':[
                        {
                            'id':member.id,
                            'name':member.username,
                            'profile_photo':member.chatuser.profile_photo.url,
                            'is_admin':member in group_admins
                        } for member in group.members.all()
                    ]
                }
            }
            return JsonResponse(response)
    except GroupRoom.DoesNotExist:
            return HttpResponseBadRequest('Group Does not exists.')
    # except Exception as e:
    #     return HttpResponseServerError('Internal Server Error : ' + str(e))

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
