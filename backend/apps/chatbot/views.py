from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q
from apps.users.models import Doctor, ProviderProfile

class ChatbotView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').lower()
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        response_message = "I'm sorry, I didn't understand that. You can ask me to find a doctor by specialization, e.g., 'I need a cardiologist'."
        doctors = []

        # Normalize message
        user_message = user_message.lower() 

        # Dictionary of terms to DB specializations
        specialization_map = {
            "cardiologist": "Cardiology",
            "cardiology": "Cardiology",
            "heart": "Cardiology",
            "dermatologist": "Dermatology",
            "dermatology": "Dermatology",
            "skin": "Dermatology",
            "neurologist": "Neurology",
            "neurology": "Neurology",
            "pediatrician": "Pediatrics",
            "pediatrics": "Pediatrics",
            "children": "Pediatrics",
            "dentist": "Dentistry",
            "dental": "Dentistry",
            "general": "General Practice",
            "gp": "General Practice"
        }

        specialization_query = None

        # Check if any keyword exists in the message
        for term, specialization in specialization_map.items():
            if term in user_message:
                specialization_query = specialization
                break
        
        # If no strict match, try to see if the user typed a known specialization directly
        if not specialization_query:
            # Check DB for strict match if possible, or just skip it for now.
            pass

        if specialization_query:
            matched_doctors = Doctor.objects.filter(
                provider_profile__specialization__icontains=specialization_query
            )[:5]
            
            if matched_doctors.exists():
                doctor_list = []
                doctors_data = []
                for doc in matched_doctors:
                    doctor_name = f"Dr. {doc.last_name}"
                    spec = doc.provider_profile.specialization
                    doctor_list.append(f"{doctor_name} ({spec})")
                    doctors_data.append({
                        "id": doc.id, 
                        "name": doctor_name, 
                        "specialization": spec,
                        # "image": doc.provider_profile.profile_image.url if doc.provider_profile.profile_image else "" 
                    })
                
                response_message = f"I found the following {specialization_query} specialists for you: " + ", ".join(doctor_list) + "."
                doctors = doctors_data
            else:
                response_message = f"I understood you are looking for {specialization_query}, but I couldn't find any doctors with that specialization right now."
        else:
             response_message = "I'm sorry, I didn't verify that specialization. Try asking for 'Cardiologist', 'Dermatologist', 'Pediatrician', etc."

        return Response({
            'message': response_message,
            'doctors': doctors
        })
