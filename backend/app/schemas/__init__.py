from app.schemas.schemas import *

# Resolve forward references
Token.model_rebuild()
RideOut.model_rebuild()
BookingOut.model_rebuild()
ReviewOut.model_rebuild()
