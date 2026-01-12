from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('provider', 'Service Provider'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    # Profile Fields
    bio = models.TextField(blank=True, default='')
    address = models.TextField(blank=True, default='') # For courier purposes
    # Storing samples as a list of URLs for simplicity in this MVP
    handwriting_samples = models.JSONField(default=list, blank=True) 
    average_rating = models.FloatField(default=0.0)

    AVAILABILITY_CHOICES = (
        ('ONLINE', 'Online'),
        ('BUSY', 'Busy'),
        ('OFFLINE', 'Offline'),
    )
    availability_status = models.CharField(max_length=10, choices=AVAILABILITY_CHOICES, default='ONLINE')

    def __str__(self):
        return self.username
