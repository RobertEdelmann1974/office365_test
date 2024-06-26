/**
 * Validate the edited records from the given source. If no source is given, will validate all edited records.
 * Returns all the validation markers with the given level.
 * 
 * @public
 * @param {JSFoundSet|JSRecord|Array<JSRecord>} [source] The source to be validated. If no source is given validate all the edited records
 * @param {Number} [level]
 * @param {*} [customObject] The extra customObject that is passed on the the validation methods.
 *
 * @return {Array<JSRecordMarker>}
 * @properties={typeid:24,uuid:"5A7C78EA-A3DE-477B-9C5C-6FE2B61F523D"}
 */
function validateEditedRecords(source, level, customObject) {
	
	var markers = [];

	/** @type {Array<JSRecord>} */
	var records = [];
	if (!source) {
		// TODO shoul get failed or edited records ?
		records = databaseManager.getEditedRecords();
	} else if (source instanceof JSFoundSet) {
		/** @type {JSFoundSet} */
		var fs = source;
		records = databaseManager.getEditedRecords(fs);
	} else if (source instanceof JSRecord) {
		records = [source];
	} else if (source instanceof Array) {
		records = source;
	}

	// return markers
	for (var i = 0; i < records.length; i++) {
		// validate the record
		databaseManager.validate(records[i], customObject);
		
		// get the error markers
		markers = markers.concat(getRecordMarkers(source, level));
	}

	return markers;
}

/**
 * @public
 * @param {JSFoundSet|JSRecord|Array<JSRecord>} [source]
 * @param {Number} [level]
 *
 * @return {Array<JSRecordMarker>}
 * @properties={typeid:24,uuid:"0E682077-98A2-444C-B20C-EEF9B8728F10"}
 */
function getRecordMarkers(source, level) {

	var markers = [];

	/** @type {Array<JSRecord>} */
	var records = [];
	if (!source) {
		// TODO shoul get failed or edited records ?
		records = databaseManager.getEditedRecords();
	} else if (source instanceof JSFoundSet) {
		/** @type {JSFoundSet} */
		var fs = source;
		records = databaseManager.getEditedRecords(fs);
	} else if (source instanceof JSRecord) {
		records = [source];
	} else if (source instanceof Array) {
		records = source;
	}

	// return markers
	for (var i = 0; i < records.length; i++) {
		if (records[i].recordMarkers) {
			if (level) {
				markers = markers.concat(records[i].recordMarkers.getMarkers(level));
			} else {
				markers = markers.concat(records[i].recordMarkers.getMarkers());
			}
		}
	}

	return markers;
}

/**
 * @public
 * @param {JSFoundSet|JSRecord|Array<JSRecord>} [source]
 *
 * @return {Array<JSRecordMarker>}
 *
 * @properties={typeid:24,uuid:"61492782-E2D8-4E8B-AAE9-22F7CC760C21"}
 */
function getErrorMarkers(source) {
	return getRecordMarkers(source, LOGGINGLEVEL.ERROR);
}

/**
 * @public
 * @param {JSFoundSet|JSRecord|Array<JSRecord>} [source]
 * @param {Number} [level]
 * @param {String} [separator]
 *
 * @return {String}
 *
 * @properties={typeid:24,uuid:"5FB36DA8-2A86-44DC-B128-9137E1F64B7D"}
 */
function getMarkerMessages(source, level, separator) {
	var markers = getRecordMarkers(source, level);
	return getMessageFromMarkers(markers);
}

/**
 * @public
 * @param {JSFoundSet|JSRecord|Array<JSRecord>} [source]
 * @param {String} [separator]
 *
 * @return {String}
 *
 * @properties={typeid:24,uuid:"21C705E0-E094-4ACC-86F7-DDBEBCDB60F2"}
 */
function getErrorMessages(source, separator) {
	return getMarkerMessages(source, LOGGINGLEVEL.ERROR, separator);
}

/**
 * @public
 * @param {Array<JSRecordMarker>} markers
 * @param {String} [separator]
 *
 * @return {String}
 *
 *
 * @properties={typeid:24,uuid:"A45BD464-048E-45FB-AE95-7AE431F847C0"}
 */
function getMessageFromMarkers(markers, separator) {
	if (!separator) separator = "\n";

	var errorMsgs = [];

	for (var i = 0; i < markers.length; i++) {
		var errorMarker = markers[i];
		errorMsgs.push(errorMarker.i18NMessage);
	}

	return errorMsgs.join(separator);
}

/**
 * Returns the JSRecordMarker for the given dataprovider
 * @param {Array<JSRecordMarker>} markers
 * @param {String} dataprovider
 * 
 * @public
 *
 * @return {Array<JSRecordMarker>} empty array if no marker found for the given dataprovider
 * @properties={typeid:24,uuid:"CFF6D78C-A2C4-4885-8C1F-088F1FAA9008"}
 */
function getMarkersWithDataprovider(markers, dataprovider) {
	if (!markers) {
		throw "Null markers argument";
	}
	if (dataprovider == null || dataprovider == undefined) {
		throw "Null dataprovider argument";
	}
	
	var result = [];	
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].dataprovider == dataprovider) {
			result.push(markers[i]);
		}
	}
	
	return result;
}

/**
 * Get the RuntimeElement linked to the given record marker
 * 
 * @param {String} formName
 * @param {JSRecordMarker} marker
 * @return {RuntimeTextField}
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"ED5A036F-1701-4526-BA31-956EFBEE7DA3"}
 */
function getMarkerElement(formName, marker) {
	// TODO what if multiple elements match the same marker ?
	
	var form = forms[formName];
	if (!form) {
		throw "Cannot find form " + formName;
	}
	
	/** @type {RuntimeTextField} */
	var element;
	var dataprovider = marker.dataprovider;
	var dataSource = marker.record ? marker.record.getDataSource() : form.foundset.getDataSource();
	
	// shall i check record pks too ?
	var isRelated = dataSource == form.foundset.getDataSource();
	
	// get field
	for (var i = 0; i < form.elements.allnames.length; i++) {
		
		/** @type {RuntimeTextField} */
		var field = form.elements[form.elements.allnames[i]];
		if (!field.getDataProviderID) {
			continue;
		}
		
		// if dataprovider match
		var dp = field.getDataProviderID();
		if (!dp) {
			continue;
		}
		
		// if dataprovider isn't related and match
		if (!isRelated && dp === dataprovider) {
			element = field;
			return element;
		}
		
		// check for relation
		var dpRelationName = scopes.svyDataUtils.getDataProviderRelationName(dp);
		var dpUnrelated = scopes.svyDataUtils.getUnrelatedDataProviderID(dp);
		var dpSource = dpRelationName ? scopes.svyDataUtils.getRelationForeignDataSource(dpRelationName) : dataSource;	

		// compare datasource and unrelated dataprovider
		if (dpSource == dataSource && dataprovider == dpUnrelated) {
			element = field;
			return element;
		}

		// TODO shall i compare record pks as well ?
		// Possible use case: having a relation on the same dataSource
//		var elementSource = scopes.svyUI.getRuntimeElementSource(formName, field.getName())
//		var elementRecord = elementSource.getRecord();
	}
	
	// If element cannot be found log a warning 
	application.output("No element can be found for the error marker with dataprovider " + dataprovider + " on dataSource " + dataSource, LOGGINGLEVEL.WARNING);
	
	return null;
}
