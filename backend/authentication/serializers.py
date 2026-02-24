from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'name_set')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get('username')
        password = attrs.get('password')

        # Try email first, then username
        user = User.objects.filter(Q(email=identifier) | Q(username=identifier)).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError({"general": ["Your account is inactive. Please contact support."]})
            attrs['username'] = user.username
            return super().validate(attrs)
        
        if not User.objects.filter(Q(email=identifier) | Q(username=identifier)).exists():
            raise serializers.ValidationError({"identifier": ["No account found with that username or email."]})
        
        raise serializers.ValidationError({"password": ["Incorrect password. Please try again."]})

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password')

    def validate_username(self, value):
        import re
        if not re.match(r'^[\w]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value.lower()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists. Try logging in instead.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match. Please try again."})
        
        if len(data['password']) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})
            
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'].lower(),
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'name_set')
        read_only_fields = ('id', 'email', 'name_set')

    def validate_username(self, value):
        import re
        user = self.context['request'].user
        new_username = value.lower()
        if not re.match(r'^[\w]+$', new_username):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return new_username

    def update(self, instance, validated_data):
        if 'name' in validated_data and not instance.name_set:
            instance.name_set = True
        return super().update(instance, validated_data)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        
        if len(data['new_password']) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
            
        return data
