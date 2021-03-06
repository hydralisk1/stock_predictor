from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

def what_we_have():
    uri = "postgres://sooagdcncjsvwm:b29199e35bf9ffef2888a8cbef6bcfc81d2bdaa8917845e70be4f8820b0dc117@ec2-35-174-88-65.compute-1.amazonaws.com:5432/d2qnvo6mticmk9"
    engine = create_engine(uri)
    Base = automap_base()
    Base.prepare(engine, reflect = True)

    Predicted = Base.classes.predicted
    
    session = Session(engine)

    query = session.query(Predicted.code)

    data = []
    # Run queries to load data from the database server
    for row in query:
        data.append(row.code)
        
    return data