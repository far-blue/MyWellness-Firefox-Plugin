

async function handleMessage(message, sender, sendResponse) {
	if (message.action === 'export') {
		const response = await fetch(
			"https://" + message.details.apiHost + "/Training/CardioLog/" + message.details.activityAnalyticsId
				+ "/Details?facilityId=" + message.details.facilityId
				+ "&_c=en-GB&AppId=" + message.details.appId
				+ "&token=" + message.details.token + "&_=1694261125737"
			);
		const analytics = await response.json();
		const tcx = buildTcxData(analytics, message.details.calories, message.details.activityTime);

		 browser.downloads.download({
			url: URL.createObjectURL(new Blob([tcx], {type: "application/vnd.garmin.tcx+xml"})),
			filename:  message.details.activityAnalyticsId + '.tcx',
			saveAs: true
		});
	}
}

function buildTcxData(activity, calories, activityTime) {

	const sportMapping = {
		'UprightBike': 'Biking',
	};

	const startDateParts = activity.data.date.split('/');
	const startTimeParts = activityTime.split(':');

	const sportType = sportMapping[activity.data.equipmentType];
	const startTime = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0], ...startTimeParts);
	const appVersion = activity.version.split('.');
	const activityId = startTime.toISOString();

	let durationSeconds;
	let distanceMeters;

	activity.data.data.forEach ((summary) => {
		switch (summary.property) {
			case 'Duration':
				durationSeconds = Math.round(summary.rawValue * 60);
				break;

			case 'HDistance':
				distanceMeters = Math.round(summary.rawValue * 1000);
				break;
		}
	});

	let dataTypeMap = {
		power: null,
		distance: null,
		cadence: null
	};

	activity.data.analitics.descriptor.forEach ((dataSetType) => {
		switch (dataSetType.pr.name) {
			case 'Power':
				dataTypeMap.power = dataSetType.i;
				break;

			case 'HDistance':
				dataTypeMap.distance = dataSetType.i;
				break;

			case 'Rpm':
				dataTypeMap.cadence = dataSetType.i;
				break;
		}
	});

	const activitySampleLookup = activity.data.analitics.samples.reduce(
		(acc, item) => {
			acc[item.t] = item.vs;
			return acc;
		},
		{}
	);

	const hrSampleLookup = activity.data.analitics.hr.reduce(
		(acc, item) => {
			acc[item.t] = item.hr;
			return acc;
		},
		{}
	);

	const startingTimestamp = startTime.getTime();
	const mutableDate = new Date();
	let activitySamples = [];

	for (let t = 1; t < durationSeconds + 1; t++) {
		mutableDate.setTime(startingTimestamp + (t * 1000));

		let activityData;
		for (let i = 0; i < 30; i++) {
			if (activitySampleLookup[t - i]) {
				activityData = activitySampleLookup[t - i]
				break;
			}
		}

		let hr;
		for (let i = 0; i < 30; i++) {
			if (hrSampleLookup[t - i]) {
				hr = hrSampleLookup[t - i]
				break;
			}
		}

		let result = '<Time>' + mutableDate.toISOString() + '</Time>';
		if (dataTypeMap.distance !== null) {
			result += '<DistanceMeters>' + activityData[dataTypeMap.distance] + '</DistanceMeters>';
		}
		result +='<HeartRateBpm><Value>' + hr + '</Value></HeartRateBpm>';

		if (dataTypeMap.cadence !== null) {
			result += '<Cadence>' + activityData[dataTypeMap.cadence] + '</Cadence>';
		}
		if (dataTypeMap.power !== null) {
			result += '<Extensions><TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2"><Watts>' + activityData[dataTypeMap.power] + '</Watts></TPX></Extensions>';
		}

		activitySamples.push(result);
	}

	let trackDetails = '<Track><Trackpoint>' + activitySamples.join('</Trackpoint><Trackpoint>') + '</Trackpoint></Track>';

	let creatorBlock = '<Creator xsi:type="Device_t"><Name>MyWellness</Name><UnitId>1</UnitId><ProductID>1</ProductID><Version><VersionMajor>'+ appVersion[0] +'</VersionMajor><VersionMinor>'+ appVersion[1] +'</VersionMinor><BuildMajor>'+ appVersion[2] +'</BuildMajor><BuildMinor>'+ appVersion[3] +'</BuildMinor></Version></Creator>'

	let tcxActivityBlock = '<Activities><Activity Sport="' + sportType + '"><Id>' + activityId + '</Id><Lap StartTime="'+ startTime.toISOString() +'"><TotalTimeSeconds>' + durationSeconds + '</TotalTimeSeconds><DistanceMeters>' + distanceMeters + '</DistanceMeters><Calories>' + calories + '</Calories><Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod>' + trackDetails + '</Lap>' + creatorBlock + '</Activity></Activities>';

	return '<?xml version="1.0" encoding="UTF-8" standalone="no"?><TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1" xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">' + tcxActivityBlock + '</TrainingCenterDatabase>';
}

browser.runtime.onMessage.addListener(handleMessage);
