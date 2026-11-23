from app.database import Base, engine
from app.models import Merchant, Product, Store, TeamMember


Base.metadata.create_all(bind=engine)

print("Database schema initialized for KIKI platform.")
