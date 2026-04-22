"""
Post-save signals that trigger async notification tasks.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
# Signals wired here will trigger email tasks.
# Example:
# from applicants.models import Applicant
# @receiver(post_save, sender=Applicant)
# def on_applicant_created(sender, instance, created, **kwargs):
#     if created:
#         from .tasks import send_invite_email
#         send_invite_email.delay(str(instance.id))
