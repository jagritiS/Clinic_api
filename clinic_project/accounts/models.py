from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('admin', 'Admin'),
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='patient'
    )

    @property
    def effective_role(self):
        if self.is_superuser:
            return 'admin'
        return self.role

    # def save(self, *args, **kwargs):
    #     # Hash the password if it's not already hashed
    #     if self.password and not (self.password.startswith('pbkdf2_sha256$') or 
    #                              self.password.startswith('bcrypt$') or 
    #                              self.password.startswith('argon2$')):
    #         self.set_password(self.password)
    #     super().save(*args, **kwargs)

    def __str__(self):
        return self.username