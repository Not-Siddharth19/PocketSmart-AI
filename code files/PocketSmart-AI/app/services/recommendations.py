from dataclasses import dataclass, field, asdict
from typing import Any
from .providers import get_shopping_links

@dataclass
class PlannerResult:
    category: str
    title: str
    summary: str
    total_budget: float
    remaining_budget: float
    allocated_budget: float
    budget_breakdown: list[dict] = field(default_factory=list)
    calculation_table: list[dict] = field(default_factory=list)
    calculation_table_inr: list[dict] = field(default_factory=list)
    recommendations: list[dict] = field(default_factory=list)
    venue_suggestions: list[dict] = field(default_factory=list)
    outfit_analysis: dict = field(default_factory=dict)
    styling_tips: list[str] = field(default_factory=list)
    additional_suggestions: list[str] = field(default_factory=list)
    allocation: list[dict] = field(default_factory=list)
    sources: list[str] = field(default_factory=list)

    # Compatibility properties
    @property
    def budget(self) -> float:
        return self.total_budget

    @property
    def total_estimate(self) -> float:
        return self.allocated_budget

    def to_dict(self) -> dict:
        d = asdict(self)
        d["budget"] = self.total_budget
        d["total_estimate"] = self.allocated_budget
        return d


def home_plan(data) -> PlannerResult:
    budget = float(getattr(data, "total_budget", getattr(data, "budget", 50000)) or 50000)
    num_lights = int(getattr(data, "num_lights", 5) or 5)
    num_fans = int(getattr(data, "num_fans", 4) or 4)
    num_furniture = int(getattr(data, "num_furniture", 2) or 2)
    num_dining = int(getattr(data, "num_dining_tables", 1) or 1)
    
    rooms_raw = getattr(data, "rooms", ["Living Room", "Bedroom", "Kitchen"])
    if isinstance(rooms_raw, str):
        rooms = [r.strip() for r in rooms_raw.split(",") if r.strip()]
    else:
        rooms = list(rooms_raw) if rooms_raw else ["Living Room"]
        
    style = getattr(data, "style", "modern") or "modern"
    extra = getattr(data, "additional_requirements", "") or ""

    # Allocations
    # 25% Lighting, 25% Fans, 30% Furniture, 15% Dining & Decor, 5% Remaining
    alloc_lighting = round(budget * 0.25, 2)
    alloc_fans = round(budget * 0.25, 2)
    alloc_furniture = round(budget * 0.30, 2)
    alloc_dining = round(budget * 0.15, 2)

    light_unit_price = round(alloc_lighting / max(1, num_lights), 2)
    fan_unit_price = round(alloc_fans / max(1, num_fans), 2)
    furn_unit_price = round(alloc_furniture / max(1, num_furniture), 2)
    dining_unit_price = round(alloc_dining / max(1, num_dining), 2)

    lighting_items = [
        {
            "name": f"LED Ambient & Spotlight Set ({style.title()})",
            "description": f"Energy-efficient warm white lighting tailored for {', '.join(rooms[:2])}.",
            "price": light_unit_price,
            "estimated_price": light_unit_price,
            "quantity": num_lights,
            "search_terms": f"{style} LED ceiling lights lamps",
            "shopping_links": get_shopping_links(f"{style} LED ceiling lights", ["Amazon", "Flipkart", "IKEA", "Myntra", "Ajio"])
        }
    ]

    fan_items = [
        {
            "name": f"Havells / Atomberg Smart BLDC Ceiling Fan",
            "description": "Silent, low-power decorative 3-blade BLDC ceiling fan with remote.",
            "price": fan_unit_price,
            "estimated_price": fan_unit_price,
            "quantity": num_fans,
            "search_terms": "BLDC decorative ceiling fan",
            "shopping_links": get_shopping_links("decorative ceiling fan with remote", ["Amazon", "Flipkart", "IKEA", "Myntra", "Ajio"])
        }
    ]

    furniture_items = [
        {
            "name": f"Contemporary {style.title()} Modular Sofa / Lounge Chairs",
            "description": f"Space-efficient, high-comfort fabric seating designed for {rooms[0] if rooms else 'Living Room'}.",
            "price": furn_unit_price,
            "estimated_price": furn_unit_price,
            "quantity": num_furniture,
            "search_terms": f"{style} living room sofa accent chair",
            "shopping_links": get_shopping_links(f"{style} sofa furniture", ["Amazon", "Flipkart", "IKEA", "Pepperfry"])
        }
    ]

    dining_items = [
        {
            "name": f"Solid Wood Compact Dining Table Set ({style.title()})",
            "description": "Durable minimalist dining unit perfect for daily family meals and hosting.",
            "price": dining_unit_price,
            "estimated_price": dining_unit_price,
            "quantity": num_dining,
            "search_terms": f"{style} dining table wooden set",
            "shopping_links": get_shopping_links(f"{style} dining table set", ["Amazon", "Flipkart", "IKEA", "Pepperfry"])
        }
    ]

    breakdown = [
        {
            "category": "Lighting",
            "allocation": alloc_lighting,
            "items": lighting_items
        },
        {
            "category": "Ceiling Fans",
            "allocation": alloc_fans,
            "items": fan_items
        },
        {
            "category": "Furniture",
            "allocation": alloc_furniture,
            "items": furniture_items
        },
        {
            "category": "Dining & Decor",
            "allocation": alloc_dining,
            "items": dining_items
        }
    ]

    allocated_total = round((light_unit_price * num_lights) + (fan_unit_price * num_fans) + (furn_unit_price * num_furniture) + (dining_unit_price * num_dining), 2)
    remaining = max(0.0, round(budget - allocated_total, 2))

    calc_table = [
        {"category": "Lighting", "items_count": num_lights, "total_cost": round(light_unit_price * num_lights, 2), "percentage_of_budget": round((alloc_lighting/budget)*100, 1)},
        {"category": "Ceiling Fans", "items_count": num_fans, "total_cost": round(fan_unit_price * num_fans, 2), "percentage_of_budget": round((alloc_fans/budget)*100, 1)},
        {"category": "Furniture", "items_count": num_furniture, "total_cost": round(furn_unit_price * num_furniture, 2), "percentage_of_budget": round((alloc_furniture/budget)*100, 1)},
        {"category": "Dining & Decor", "items_count": num_dining, "total_cost": round(dining_unit_price * num_dining, 2), "percentage_of_budget": round((alloc_dining/budget)*100, 1)},
    ]

    flat_recs = []
    for b in breakdown:
        for it in b["items"]:
            flat_recs.append({
                "name": it["name"],
                "kind": b["category"],
                "estimated_price": it["estimated_price"],
                "reason": it["description"],
                "links": it["shopping_links"]
            })

    suggestions = [
        "Consider purchasing modular or flat-pack furniture for further cost savings and easy setup.",
        "Look for seasonal sales and festive discount vouchers on Amazon, Flipkart, and IKEA.",
        "Prioritize core functional lighting and fans before investing heavily in accent decor pieces."
    ]

    summary = f"Custom {style.title()} interior layout planned across {', '.join(rooms)} within budget ₹{budget:,.2f}."

    return PlannerResult(
        category="home",
        title="Your Personalized Budget Plan",
        summary=summary,
        total_budget=budget,
        remaining_budget=remaining,
        allocated_budget=allocated_total,
        budget_breakdown=breakdown,
        calculation_table=calc_table,
        calculation_table_inr=calc_table,
        recommendations=flat_recs,
        additional_suggestions=suggestions,
        sources=["IKEA", "Amazon", "Flipkart", "Pepperfry", "Myntra", "Ajio"]
    )


def party_plan(data) -> PlannerResult:
    budget = float(getattr(data, "total_budget", getattr(data, "budget", 30000)) or 30000)
    guests = int(getattr(data, "num_guests", getattr(data, "guests", 20)) or 20)
    party_type = getattr(data, "party_type", getattr(data, "event_type", "Birthday")) or "Birthday"
    venue_type = getattr(data, "venue_type", getattr(data, "venue", "Home / Banquet")) or "Home / Banquet"
    needs_catering = getattr(data, "needs_catering", True)
    needs_decor = getattr(data, "needs_decoration", True)
    needs_entertainment = getattr(data, "needs_entertainment", True)
    extra = getattr(data, "additional_requirements", "") or ""

    # Budget Split
    # Catering: 45%, Venue: 20%, Decor: 15%, Entertainment: 12%, Contingency: 8%
    cat_alloc = round(budget * 0.45, 2) if needs_catering else 0.0
    ven_alloc = round(budget * 0.20, 2)
    dec_alloc = round(budget * 0.15, 2) if needs_decor else 0.0
    ent_alloc = round(budget * 0.12, 2) if needs_entertainment else 0.0
    con_alloc = round(budget * 0.08, 2)

    total_alloc = round(cat_alloc + ven_alloc + dec_alloc + ent_alloc + con_alloc, 2)
    remaining = max(0.0, round(budget - total_alloc, 2))

    breakdown = [
        {
            "category": "Venue",
            "allocation": ven_alloc,
            "items": [
                {
                    "name": f"{party_type.title()} Venue Reservation / Space Setup ({venue_type})",
                    "description": f"Space booking and seating arrangement sized for {guests} guests.",
                    "estimated_price": ven_alloc,
                    "search_terms": f"event venue hall near {venue_type}",
                    "shopping_links": get_shopping_links(f"event venue hotel {venue_type}", ["OYO", "MakeMyTrip", "Booking", "NoBroker", "Google"])
                }
            ]
        },
        {
            "category": "Catering",
            "allocation": cat_alloc,
            "items": [
                {
                    "name": f"Curated Multi-Course Buffet & Appetizers for {guests} Guests",
                    "description": f"Balanced vegetarian & non-vegetarian party platters with beverages and desserts (~₹{round(cat_alloc/max(1,guests), 1)}/guest).",
                    "estimated_price": cat_alloc,
                    "search_terms": f"party catering food box {party_type}",
                    "shopping_links": get_shopping_links(f"party food catering {party_type}", ["Swiggy", "Zomato", "BigBasket", "Amazon"])
                }
            ]
        },
        {
            "category": "Decoration",
            "allocation": dec_alloc,
            "items": [
                {
                    "name": f"Theme Backdrop, Arch Balloons, & Fairy Light Set",
                    "description": f"Color-coordinated party decorations tailored for a {party_type} celebration.",
                    "estimated_price": dec_alloc,
                    "search_terms": f"{party_type} theme decoration set balloon banner",
                    "shopping_links": get_shopping_links(f"{party_type} decoration party kit", ["Amazon", "Flipkart", "Meesho"])
                }
            ]
        },
        {
            "category": "Entertainment",
            "allocation": ent_alloc,
            "items": [
                {
                    "name": "Bluetooth Party Speaker & Interactive Games Package",
                    "description": "Curated playlist setup, karaoke microphone, and group party board games.",
                    "estimated_price": ent_alloc,
                    "search_terms": "party bluetooth speaker karaoke games",
                    "shopping_links": get_shopping_links("party karaoke speaker games", ["Amazon", "Flipkart", "BookMyShow"])
                }
            ]
        },
        {
            "category": "Contingency & Return Gifts",
            "allocation": con_alloc,
            "items": [
                {
                    "name": f"Return Gifts & Buffer Allowance ({guests} packs)",
                    "description": "Emergency budget buffer and personalized return gift favors for attendees.",
                    "estimated_price": con_alloc,
                    "search_terms": f"return gifts party favors for {guests} guests",
                    "shopping_links": get_shopping_links("party return gift packs", ["Amazon", "Flipkart", "Meesho", "Myntra"])
                }
            ]
        }
    ]

    calc_table = [
        {"category": "Venue", "items_count": 1, "total_cost": ven_alloc, "percentage_of_budget": round((ven_alloc/budget)*100, 1)},
        {"category": "Catering", "items_count": 1, "total_cost": cat_alloc, "percentage_of_budget": round((cat_alloc/budget)*100, 1)},
        {"category": "Decoration", "items_count": 1, "total_cost": dec_alloc, "percentage_of_budget": round((dec_alloc/budget)*100, 1)},
        {"category": "Entertainment", "items_count": 1, "total_cost": ent_alloc, "percentage_of_budget": round((ent_alloc/budget)*100, 1)},
        {"category": "Contingency", "items_count": 1, "total_cost": con_alloc, "percentage_of_budget": round((con_alloc/budget)*100, 1)},
    ]

    venue_suggestions = [
        {
            "name": f"{venue_type.title()} Banquet & Lounge",
            "type": venue_type,
            "capacity": guests + 10,
            "estimated_cost": ven_alloc,
            "search_terms": f"{venue_type} party hall booking",
            "shopping_links": get_shopping_links(f"party hall {venue_type}", ["OYO", "MakeMyTrip", "Booking", "Google"])
        }
    ]

    suggestions = [
        "Pre-order food platters via bulk catering options on Swiggy or Zomato to save up to 20%.",
        "Utilize reusable DIY decor elements and energy-efficient fairy lights for a stunning ambient look.",
        "Prepare digital invitations and Spotify collaborative playlists to keep entertainment dynamic and zero-cost."
    ]

    flat_recs = []
    for b in breakdown:
        for it in b["items"]:
            flat_recs.append({
                "name": it["name"],
                "kind": b["category"],
                "estimated_price": it["estimated_price"],
                "reason": it["description"],
                "links": it["shopping_links"]
            })

    summary = f"Comprehensive {party_type.title()} plan for {guests} guests at {venue_type} within budget ₹{budget:,.2f}."

    return PlannerResult(
        category="party",
        title="Your Party Budget Plan",
        summary=summary,
        total_budget=budget,
        remaining_budget=remaining,
        allocated_budget=total_alloc,
        budget_breakdown=breakdown,
        calculation_table=calc_table,
        calculation_table_inr=calc_table,
        recommendations=flat_recs,
        venue_suggestions=venue_suggestions,
        additional_suggestions=suggestions,
        sources=["Swiggy", "Zomato", "BigBasket", "BookMyShow", "Amazon", "Flipkart", "OYO", "MakeMyTrip", "Booking"]
    )


def jewelry_plan(data, outfit_analysis_result: dict | None = None) -> PlannerResult:
    budget = float(getattr(data, "total_budget", getattr(data, "budget", 20000)) or 20000)
    occasion = getattr(data, "occasion", "Wedding / Festival") or "Wedding / Festival"
    style = getattr(data, "style", getattr(data, "preferences", "Traditional Elegance")) or "Traditional Elegance"

    analysis = outfit_analysis_result or {
        "colors": ["Royal Blue", "Gold Accents"],
        "style": style.title(),
        "formality": "Formal / Festive" if any(w in occasion.lower() for w in ["wedding", "festive", "reception", "party"]) else "Smart Casual"
    }

    # Allocations: Necklace 40%, Earrings 25%, Bracelet/Bangles 20%, Ring/Watch 10%, Buffer 5%
    p_neck = round(budget * 0.40, 2)
    p_ear = round(budget * 0.25, 2)
    p_brac = round(budget * 0.20, 2)
    p_ring = round(budget * 0.10, 2)

    total_alloc = round(p_neck + p_ear + p_brac + p_ring, 2)
    remaining = max(0.0, round(budget - total_alloc, 2))

    recs = [
        {
            "item_type": "Necklace",
            "name": f"Statement {style.title()} Choker / Pendant Necklace",
            "description": f"Designed to accentuate neckline for {occasion}, harmonizing with {', '.join(analysis.get('colors', ['outfit']))}.",
            "style": style.title(),
            "price": p_neck,
            "estimated_price": p_neck,
            "search_terms": f"{style} necklace set for {occasion}",
            "shopping_links": get_shopping_links(f"{style} necklace {occasion}", ["Tanishq", "CaratLane", "Bluestone", "Amazon", "Flipkart", "Melorra"])
        },
        {
            "item_type": "Earrings",
            "name": f"{style.title()} Jhumkas / Drop Earrings",
            "description": f"Lightweight matching earrings crafted to complement the necklace and enhance facial symmetry.",
            "style": style.title(),
            "price": p_ear,
            "estimated_price": p_ear,
            "search_terms": f"{style} earrings {occasion}",
            "shopping_links": get_shopping_links(f"{style} earrings", ["Tanishq", "CaratLane", "Bluestone", "Amazon", "Flipkart", "Meesho"])
        },
        {
            "item_type": "Bracelet / Bangles",
            "name": f"Delicate {style.title()} Kada / Tennis Bracelet",
            "description": "Refined wristwear that adds shimmer without overwhelming other accessories.",
            "style": style.title(),
            "price": p_brac,
            "estimated_price": p_brac,
            "search_terms": f"{style} bracelet bangles",
            "shopping_links": get_shopping_links(f"{style} bracelet bangles", ["CaratLane", "Bluestone", "Amazon", "Flipkart", "Melorra"])
        },
        {
            "item_type": "Finger Ring / Watch",
            "name": f"Adjustable Solitaire / Kundan Finger Ring",
            "description": "Finishing touch piece offering timeless sophistication under budget constraints.",
            "style": style.title(),
            "price": p_ring,
            "estimated_price": p_ring,
            "search_terms": f"{style} ring watch {occasion}",
            "shopping_links": get_shopping_links(f"{style} ring {occasion}", ["Tanishq", "CaratLane", "Bluestone", "Amazon", "Flipkart", "Meesho"])
        }
    ]

    breakdown = [
        {"category": r["item_type"], "allocation": r["estimated_price"], "items": [r]} for r in recs
    ]

    calc_table = [
        {"category": r["item_type"], "items_count": 1, "total_cost": r["estimated_price"], "percentage_of_budget": round((r["estimated_price"]/budget)*100, 1)}
        for r in recs
    ]

    tips = [
        "Pair gold-toned jewelry with warm-toned fabrics (red, maroon, royal yellow) and silver/platinum with cool tones (emerald green, navy, pastels).",
        "If your necklace is heavy and elaborate, opt for understated stud or drop earrings to keep the overall look balanced.",
        "Store your jewelry pieces in airtight velvet-lined pouches to prevent oxidation and maintain polish longevity."
    ]

    flat_recs = []
    for r in recs:
        flat_recs.append({
            "name": r["name"],
            "kind": r["item_type"],
            "estimated_price": r["estimated_price"],
            "reason": r["description"],
            "links": r["shopping_links"]
        })

    summary = f"Curated {style.title()} jewelry ensemble for {occasion} tailored to your ₹{budget:,.2f} budget."

    return PlannerResult(
        category="jewelry",
        title="Your Personalized Jewelry Recommendations",
        summary=summary,
        total_budget=budget,
        remaining_budget=remaining,
        allocated_budget=total_alloc,
        budget_breakdown=breakdown,
        calculation_table=calc_table,
        calculation_table_inr=calc_table,
        recommendations=flat_recs,
        outfit_analysis=analysis,
        styling_tips=tips,
        sources=["Tanishq", "CaratLane", "Bluestone", "Amazon", "Flipkart", "Melorra", "Meesho"]
    )
