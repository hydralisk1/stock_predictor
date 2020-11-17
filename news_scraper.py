import requests
from bs4 import BeautifulSoup as bs
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

def news_scraper(code):
    uri = "postgres://sooagdcncjsvwm:b29199e35bf9ffef2888a8cbef6bcfc81d2bdaa8917845e70be4f8820b0dc117@ec2-35-174-88-65.compute-1.amazonaws.com:5432/d2qnvo6mticmk9"
    
    engine = create_engine(uri)
    Base = automap_base()
    Base.prepare(engine, reflect = True)

    Stock_codes = Base.classes.stock_codes
    session = Session(engine)
    query = session.query(Stock_codes.name).filter(Stock_codes.code == code)

    for row in query:
        search = row.name
    
    url = f"https://news.google.com/search?q={search}&hl=en-US&gl=US&ceid=US:en"
    
    response = requests.get(url)
    soup = bs(response.content, "html.parser")
    cwiz = soup.find_all("c-wiz")

    news = {
        "title": [],
        "link": [],
        "source": [],
        "date": []
    }

    for title in cwiz[1].find_all("a", {"class": "DY5T1d"}, href=True):
        news["title"].append(title.text)
        news["link"].append(f"https://news.google.com{title['href'][1:]}")

    for source in cwiz[1].find_all("a", {"class": "wEwyrc AVN2gc uQIVzc Sksgp"}):
        news["source"].append(source.text)
    
    for date in cwiz[1].find_all("time", {"class": "WW6dff uQIVzc Sksgp"}):
        news["date"].append(date.text)

    return news