Content
=======

Query 1
-------

Lists the four cities with the most events in November 2012:

	SELECT DISTINCT ?city (COUNT(?event) AS ?events)
	WHERE {
		?event a ah:Event ;
			ah:venue ?venue ;
			time:hasBeginning ?date .
	
		?venue ah:locationAddress ?address .
	
		?address vcard:locality ?city .
	
		FILTER (?date >= "2012-11-01"^^xsd:dateTime)
		FILTER (?date < "2012-12-01"^^xsd:dateTime)
	} 
	GROUP BY ?city
	ORDER BY DESC(?events)
	LIMIT 4

- Multiple objects, combine
- FILTER
- GROUP BY
- ORDER BY
- COUNT

Query 2
-------

Get all the venues with more than one event in first week of November 2012 in Amsterdam

	SELECT ?venue ?title
	WHERE {
		?venue dc:title ?title ;
		FILTER (langMatches(lang(?title), "nl"))   
		{
			SELECT DISTINCT ?venue
			WHERE {
				?venue a ah:Venue ;
					ah:locationAddress ?address .	
				?address vcard:locality ?city .
		
				?event a ah:Event ;
					ah:venue ?venue ;
					time:hasBeginning ?date .
	
				FILTER (?date >= "2012-11-01"^^xsd:dateTime)
				FILTER (?date < "2012-11-08"^^xsd:dateTime)
			} 
			GROUP BY ?venue 
			ORDER BY DESC(?events)
			LIMIT 10
		}
	}

- langMatches
- Subselect

Query 3
-------
Select events for selected venue

	SELECT ?event ?date ?title ?description ?genreLabel ?homepage
	WHERE {
		?event ah:venue <http://data.artsholland.com/venue/b3d03be7-b856-43cc-bc37-4888a7e9df15> ;
			time:hasBeginning ?date ;	
			ah:production ?production .
		
		?production	dc:description ?description	;
			dc:title ?title ;		
			ah:genre ?genre .
		
		?genre rdfs:label ?genreLabel .
	
		OPTIONAL {
			?production foaf:homepage ?homepage .
		}
		
		FILTER (?date >= "2012-11-01"^^xsd:dateTime)
		FILTER (?date < "2012-11-08"^^xsd:dateTime)
		
		FILTER (langMatches(lang(?title), "nl"))
		FILTER (langMatches(lang(?description), "nl"))
	} 
	ORDER BY ?date
	
- OPTIONAL
- namespace, PREFIX


Model
=======

Query 1
-------

Ook link naar query zónder FILTER (dus alle classes)

	SELECT DISTINCT ?class
	WHERE {
		[] a ?class
		FILTER (?class = <http://purl.org/artsholland/1.0/Event> 
			|| ?class = <http://purl.org/artsholland/1.0/Venue> 
			|| ?class = <http://purl.org/artsholland/1.0/Production>
		)	 
	
	}
	LIMIT 100
	
- || in filters
- []

Query 2
-------

	SELECT DISTINCT ?predicate ?range
	WHERE {
		?subject a ah:Event ;
			?predicate ?object .
		OPTIONAL {
			?predicate rdfs:range ?range .
		}
	} LIMIT 100	
	

- Links to other AH objects
- range, domain
- triples (?s ?p ?o) http://www.w3.org/TR/rdf-concepts/#section-triples