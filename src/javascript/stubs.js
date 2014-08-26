module.exports = (function() {
  var multipleElections = {
    "kind": "civicinfo#voterInfoResponse",
    "election": {
      "id" : 1000,
      "name" : "Multiple Result Sample Election",
      "electionDay" : "2015-01-26"
    },
    "otherElections": [{
        "id" : 1000,
        "name" : "Multiple Result Sample Election",
        "electionDay" : "2015-01-26"
      }, {
        "id" : 1000,
        "name" : "Multiple Result Sample Election",
        "electionDay" : "2015-01-26"
      },
    ],
    "normalizedInput": {
      "locationName": "Hayek's Pharmacy",
      "line1": "4000 N. Downer Ave.",
      "city": "Milwaukee",
      "state": "Wisconsin",
      "zip": "53211"
    },
    "pollingLocations": [
      {
        "id": 10,
        "address": {
          "locationName": "St. Robert's School",
          "line1": "200 N. Capitol Drive.",
          "city": "Milwaukee",
          "state": "Wisconsin",
          "zip": 53211
        },
        "notes": "Please park in the back parking lot and walk around the building to the front of the rectory, take a left then a right and enter through the double doors.",
        "pollingHours": "8AM - 9PM",
        "name": "St. Robert's School",
        "voterServices": "There is a ramp for people with disabilities",
        "startDate": "2015-01-26",
        "endDate": "2015-01-26",
        "sources": [
          {
            "name": "Milwaukee Journal Sentinel",
            "official": false
          }
        ]
      },
      {
        "id": 11,
        "address": {
          "locationName": "Shorewood High School",
          "line1": "1600 N. Capitol Drive.",
          "city": "Shorewood",
          "state": "Wisconsin",
          "zip": 53211
        },
        "notes": "Voting registration in the North Gym.",
        "pollingHours": "9AM - 8PM",
        "name": "Shorewood High School",
        "voterServices": "Registration services and information.",
        "startDate": "2015-01-26",
        "endDate": "2015-01-26",
        "sources": [
          {
            "name": "Milwaukee Journal Sentinel",
            "official": false
          }
        ]
      }
    ],
    "earlyVoteSites": [],
    "contests": [
      {
        "id": 2000,
        "type": string,
        "primaryParty": string,
        "electorateSpecifications": string,
        "special": string,
        "office": string,
        "level": string,
        "district": {
          "name": string,
          "scope": string,
          "id": string
        },
        "numberElected": long,
        "numberVotingFor": long,
        "ballotPlacement": long,
        "candidates": [
          {
            "name": string,
            "party": string,
            "candidateUrl": string,
            "phone": string,
            "photoUrl": string,
            "email": string,
            "orderOnBallot": long,
            "channels": [
              {
                "type": string,
                "id": string
              }
            ]
          }
        ],
        "referendumTitle": string,
        "referendumSubtitle": string,
        "referendumUrl": string,
        "sources": [
          {
            "name": string,
            "official": boolean
          }
        ]
      }
    ],
    "state": [
      {
        "id": string,
        "name": string,
        "electionAdministrationBody": {
          "name": string,
          "electionInfoUrl": string,
          "electionRegistrationUrl": string,
          "electionRegistrationConfirmationUrl": string,
          "absenteeVotingInfoUrl": string,
          "votingLocationFinderUrl": string,
          "ballotInfoUrl": string,
          "electionRulesUrl": string,
          "voter_services": [
            string
          ],
          "hoursOfOperation": string,
          "correspondenceAddress": {
            "locationName": string,
            "line1": string,
            "line2": string,
            "line3": string,
            "city": string,
            "state": string,
            "zip": string
          },
          "physicalAddress": {
            "locationName": string,
            "line1": string,
            "line2": string,
            "line3": string,
            "city": string,
            "state": string,
            "zip": string
          },
          "electionOfficials": [
            {
              "name": string,
              "title": string,
              "officePhoneNumber": string,
              "faxNumber": string,
              "emailAddress": string
            }
          ]
        },
        "local_jurisdiction": (AdministrationRegion),
        "sources": [
          {
            "name": string,
            "official": boolean
          }
        ]
      }
    ]
  };

  return {
    multipleElections
  };
})();