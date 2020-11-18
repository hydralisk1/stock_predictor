from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import pandas_datareader as web
import pandas as pd
from datetime import date, timedelta
from whatwehave import what_we_have
from read_data import read_predcited_data
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
companies = what_we_have()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chart")
def chart():
    return render_template("visualizations.html")

@app.route("/resource")
def resource():
    return render_template("resource.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/api")
def api():
    if request.args.get("code"):
        code = request.args.get("code")
    else:
        code = companies[0]

    end = date.today().strftime("%Y-%m-%d")

    start="2012-01-01"
    df = web.DataReader(code, data_source="yahoo", start=start, end=end)
    df = df.reset_index()
    df.Date = df.Date.dt.strftime("%Y-%m-%d")
    value = [{"date": df.loc[i, "Date"],
            "high": float(df.loc[i, "High"]),
            "low": float(df.loc[i, "Low"]),
            "open": float(df.loc[i, "Open"]),
            "close": float(df.loc[i, "Close"]),
            "volume": float(df.loc[i, "Volume"]),
            "adj_close": float(df.loc[i, "Adj Close"])} for i in df.index]
    
    data = {
        "code": code,
        "value": value,
        "pred_prices": read_predcited_data(code),
        "companies": companies
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run()