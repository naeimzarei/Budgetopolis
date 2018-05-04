import pymongo
from pymongo import MongoClient

data = {
  "community": "city",
  "Police": [{
    "Cut Patrol Officer": "75000"
  }, {
    "Cut Detective": "100000"
  }, {
    "School safety: eliminate crossing guards and school resource officers": "750000"
  }, {
    "Consolidate police communications with other governments": "1000000"
  }],
  "Fire": [{
        "Close Fire Station": "800000"},
        {
          "Eliminate Inspectors": "200000"
        },
        {
          "Eliminate medic training": "850000"
        }], "Solid Waste": [{
        "Garbage collection every other week instead of weekly": "1000000"
      }, {
        "Reduce recycling from weekly to monthly": "900000"
      }, {
        "Reduce brush collection from monthly to quarterly": "1000000"
      }, {
        "Privatize commercial garbage collection": "1000000"
      }], "Streets": [{
          "Reduce repaving": "750000"
        }, {
          "Reduce sidewalk repair": "700000"
        }, {
          "Reduce street cleaning by 50%": "1000000"},
          {
            "Contract for street repairs and maintenance": "1000000"
          }], "Parks and Rec": [{
          "Close 2 parks and recreation centers": "1000000"
        }, {
          "Close a senior center": "1200000"
        }, {
          "Eliminate athletic programs": "1000000"
        }], "Capital": [{
          "Delay improvements to water plant": "1000000"
        }, {
          "Cut street construction": "800000"
        }, {
          "No equipment purchases": "750000"
        }], "Housing": [{
          "Cut maintenance grants": "800000"
        }, {
          "Cut loans for new housing": "1000000"
        }], "Planning and Economic Development": [{
          "Eliminate economic development assistance": "1000000"
        }, {
          "Consolidate planning with other governments": "1000000"
        }], "Reserves": [{
          "Spend and not fund": "1000000"
        }]
      }
connection = MongoClient('mongodb://admin:goheels@cluster0-shard-00-00-vmz9n.mongodb.net:27017,cluster0-shard-00-01-vmz9n.mongodb.net:27017,cluster0-shard-00-02-vmz9n.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin')
db = connection.budgetopolis
collection  = db['Resources']

result = collection.insert(data)
print(result)