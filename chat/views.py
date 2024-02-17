from django.shortcuts import render , get_object_or_404 , redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse , HttpResponseBadRequest , HttpResponseServerError

from .utils import get_or_create_private_room 
from .models import GroupRoom , ChatUser 
from .forms import ProfileForm

# Create your views here.
User = get_user_model()

@login_required
def home(request):
    users = User.objects.all()
    group_rooms = GroupRoom.objects.all()
    context = {
        'users':users,
        'group_rooms':group_rooms
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
def profile(request , chatuser_id):
    user_object = ChatUser.objects.get(id=chatuser_id)
    context = {
        'user_object':user_object
    }
    return render(request,'chat/profile.html',context)




def search(request):
    query = request.GET.get('q', '')
    users = [{'id':user.id,'name': user.username, 'type': 'user','profile_photo':user.chatuser.profile_photo.url} for user in User.objects.filter(username__icontains=query)]
    groups = [{'id':group.id,'name': group.name, 'type': 'group','logo':group.logo.url} for group in GroupRoom.objects.filter(name__icontains=query)]

    results = users + groups
    return JsonResponse(results, safe=False)


@login_required
def get_my_rooms(request):
    users = [{'name': user.username, 'type': 'user','profile_photo':user.chatuser.profile_photo.url,'id':user.id} for user in User.objects.all()]
    groups = [{'name': group.name, 'type': 'group','logo':group.logo.url,'id':group.id} for group in GroupRoom.objects.all()]

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
        user2 = get_object_or_404(User, id=user_id)
        room = get_or_create_private_room(request.user, user2)
        messages = room.messages.all()

        context = {
            'room_id': str(room.id),
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