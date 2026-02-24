from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class DevAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if getattr(settings, 'AUTH_DISABLED', False):
            if not request.user.is_authenticated:
                user, _ = User.objects.get_or_create(username='testuser', email='test@example.com')
                request.user = user
                
        response = self.get_response(request)
        return response
