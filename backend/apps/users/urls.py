from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, UserMeView, ProviderListView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('providers/', ProviderListView.as_view(), name='providers'),
]
