from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import perform_login
from django.contrib.auth import get_user_model

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed
        (and before the pre_social_login signal is emitted).

        We're going to use this method to connect the social account
        to an existing user if the email address matches.
        """
        User = get_user_model()
        
        # If user is already logged in, the default behavior will connect
        # the new social account to the existing user.
        if request.user.is_authenticated:
            return

        # If the social account is already connected to a user, the default
        # behavior will log that user in.
        if sociallogin.is_existing:
            return

        # If the social account is not connected, check if a user with
        # the same email address exists.
        if 'email' in sociallogin.account.extra_data:
            email = sociallogin.account.extra_data['email']
            try:
                user = User.objects.get(email=email)
                sociallogin.connect(request, user)
                # sociallogin.state['process'] = 'connect' # Optional, depends on flow
            except User.DoesNotExist:
                pass
