from urllib.parse import quote_plus

PROVIDERS = {
    "Amazon": "https://www.amazon.in/s?k={q}",
    "Flipkart": "https://www.flipkart.com/search?q={q}",
    "IKEA": "https://www.ikea.com/in/en/search/?q={q}",
    "Myntra": "https://www.myntra.com/search?q={q}",
    "Ajio": "https://www.ajio.com/search/?text={q}",
    "Pepperfry": "https://www.pepperfry.com/site_product/search?q={q}",
    "Swiggy": "https://www.swiggy.com/search?query={q}",
    "Zomato": "https://www.zomato.com/search?query={q}",
    "BigBasket": "https://www.bigbasket.com/ps/?q={q}",
    "BookMyShow": "https://in.bookmyshow.com/search?q={q}",
    "OYO": "https://www.oyorooms.com/search?q={q}",
    "MakeMyTrip": "https://www.makemytrip.com/hotels/hotel-listing/?searchText={q}",
    "Booking": "https://www.booking.com/search.html?ss={q}",
    "NoBroker": "https://www.nobroker.in/property/search/pune?searchTerm={q}",
    "Bluestone": "https://www.bluestone.com/search.html?query={q}",
    "Tanishq": "https://www.tanishq.co.in/search?q={q}",
    "CaratLane": "https://www.caratlane.com/search?q={q}",
    "Melorra": "https://www.melorra.com/search?q={q}",
    "Meesho": "https://www.meesho.com/search?q={q}",
    "Google": "https://www.google.com/search?q={q}",
}

def get_shopping_links(search_term: str, provider_names: list[str]) -> list[dict]:
    clean_term = search_term.strip()
    return [
        {"provider": p, "url": PROVIDERS[p].format(q=quote_plus(clean_term))}
        for p in provider_names
        if p in PROVIDERS
    ]

# Backwards compatibility alias
def links(query: str, providers: list[str]) -> list[dict]:
    return get_shopping_links(query, providers)
