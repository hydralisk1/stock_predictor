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

            chart(value.value, value.pred_prices, value.code);
        });
    });
}

function chart(stock_prices, pred_prices, code){
    var chart_stock = stock_prices.slice(-30);

    var trace1 = {
        x: chart_stock.map(d => d.date),
        y: chart_stock.map(d => d.close),
        mode: "lines",
        name: "Actual Prices",
        type: "scatter"
    };

    var next_days = d => {
        var days = [];
        var dates = new Date();
        var dayofweek = dates.getDay();
        dates.setDate(dates.getDate()-dayofweek-2);
        var format = d3.timeFormat("%Y-%m-%d");
        days.push(format(dates));
        dates.setDate(dates.getDate()+2);
        for(var i=0;i<=5;i++){
            days.push(format(dates.setDate(dates.getDate()+1)));
        }
        
        return days;
    }

    var dayofweek = new Date();
    dayofweek = dayofweek.getDay();
    var predicted_prices = pred_prices.map(d=>+d);
    if(dayofweek === 0 || dayofweek === 1 || dayofweek === 6)
        var back = -1;
    else
        var back = dayofweek*-1-1; 

    predicted_prices.unshift(chart_stock.slice(back, back+1).pop()["close"]);

    var trace2 = {
        x: next_days(chart_stock.slice(-1).pop()["date"]),
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
            showgrid: false,
            showline: true
        },
        yaxis: {
            title: {text: "USD ($)"},
            showgrid: false,
            showline: true
        }
    };

    Plotly.newPlot("chartDiv", [trace1, trace2], layout);
}

optionChanged("AAPL");