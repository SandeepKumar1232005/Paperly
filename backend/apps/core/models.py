from django.db import models
from django.core.cache import cache

class SystemSettings(models.Model):
    maintenance_mode = models.BooleanField(default=False)
    platform_fee_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    general_notification = models.TextField(blank=True, default='')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        cache.set('system_settings', self)

    @classmethod
    def get_settings(cls):
        settings = cache.get('system_settings')
        if not settings:
            settings, created = cls.objects.get_or_create(id=1)
            cache.set('system_settings', settings)
        return settings

    def __str__(self):
        return "System Settings"
