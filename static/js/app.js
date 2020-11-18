var days = 30;

function optionChanged(code){
    d3.csv("static/resources/stock_codes.csv").then(data =>{
        d3.json(`api?code=${code}`).then(value =>{
            var source = [];
            var companies = value.companies;
            
            data.forEach(d => {
                if(companies.includes(d.code))
                    source.push({label: `[${d.code}] ${d.name}`, value: d.code});
                
            d3.select("#selDataset")
              .selectAll("option")
              .data(source)
              .enter()
              .append("option")
              .attr("value", d => d.value)
              .text(d => d.label);
            });

            var daysOpt = [30, 60, 90];

            d3.select("#days")
              .selectAll("option")
              .data(daysOpt)
              .enter()
              .append("option")
              .attr("value", d => d)
              .text(d => `${d} days`);

            d3.selectAll("#days")
              .on("click", function() {
                    if(days !== +this.value)
                        days = this.value;
                        chart(value.value, value.pred_prices, value.code, days);
              });

            chart(value.value, value.pred_prices, value.code, days);
        });
    });
}

function chart(stock_prices, pred_prices, code, days){
    var chart_stock = stock_prices.slice(days*-1);

    var trace1 = {
        x: chart_stock.map(d => d.date),
        y: chart_stock.map(d => d.close),
        mode: "lines",
        name: "Actual Prices",
        type: "scatter"
    };

    var lastFriDay = new Date();
    var dayofweek = lastFriDay.getDay();

    if(dayofweek === 6 || dayofweek === 7)
        lastFriDay.setDate(lastFriDay.getDate()-dayofweek+5);
    else
        lastFriDay.setDate(lastFriDay.getDate()-dayofweek-2);
    
    var next_days = () => {
        var format = d3.timeFormat("%Y-%m-%d");
        var datesThisWeek = [];
        datesThisWeek.push(format(lastFriDay));
        var thisWeek = new Date(lastFriDay);
        
        thisWeek.setDate(thisWeek.getDate()+2);
        for(var i=0;i<5;i++){
            datesThisWeek.push(format(thisWeek.setDate(thisWeek.getDate()+1)));
        }
        
        return datesThisWeek;
    }

    var predicted_prices = pred_prices.map(d => d);
    var lastFriDayPrice = d =>{
        var format = d3.timeFormat("%Y-%m-%d");
        var returnPrice = 0;
        d.forEach(p => {
            if(format(lastFriDay) === p.date)
                returnPrice = p.close;
        });
        return returnPrice;
    };

    predicted_prices.unshift(lastFriDayPrice(chart_stock));

    var trace2 = {
        x: next_days(),
        y: predicted_prices,
        mode: "lines",
        name: "Predicted Prices",
        type: "scatter"
    };

    var layout = {
        title: `${code.toUpperCase()} Close Prices`,
        xaxis: {
            title: {text: "Date"},
            tickformat: "%m-%d-%Y",
            showline: true
        },
        yaxis: {
            title: {text: "USD ($)"},
            showline: true
        }
    };

    Plotly.newPlot("chartDiv", [trace1, trace2], layout);
}

optionChanged("AAL");