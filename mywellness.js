function requestExportActivity(event) {
	event.preventDefault();
	event.stopPropagation();

	const activityTime = document.getElementById('activityTime').value;

	event.target.parentElement.style.display = "none";

	browser.runtime.sendMessage({
		action: "export",
		details: {
			activityTime: activityTime,
			activityAnalyticsId: window.wrappedJSObject.physicalActivityAnalyticsId,
			facilityId: window.wrappedJSObject.facilityId,
			token: window.wrappedJSObject.EU.currentUser.token,
			appId: window.wrappedJSObject.EU.config.API_APP_ID,
			apiHost: window.wrappedJSObject.EU.config.API_HOST,
			calories: document.querySelector("table.exercise-table tr:nth-child(3) td:nth-child(2)").textContent.replace(" kcal", "")
		}
	});
}

function installExportButton() {
	document.getElementById("exportButton")?.remove();
	document.getElementById("exportForm")?.remove();

	let exportButton = document.createElement('div');
	exportButton.innerHTML = '<a class="enabled-button" style="padding: 0px;"><span style="display: block; padding: 5px 30px;">Export</span></a>';
	exportButton.id = "exportButton";
	exportButton.setAttribute("class", "button grey");
	exportButton.setAttribute("style", "width: 130px; float: left; font-size: 18px; padding: 0px;");
	document.querySelector("div.side div.button.previous").after(exportButton);

	let exportTimeField = document.createElement('input');
	exportTimeField.setAttribute('id', 'activityTime');
	exportTimeField.setAttribute('value', '12:00:00');
	exportTimeField.setAttribute('style', 'width: 100px; margin: 5px;');

	let exportSubmit = document.createElement('input');
	exportSubmit.setAttribute('type', 'submit');
	exportSubmit.setAttribute('value', 'Download');

	let exportForm = document.createElement('form');
	exportForm.appendChild(exportTimeField);
	exportForm.appendChild(exportSubmit);

	let exportDateFormWrapper = document.createElement('div');
	exportDateFormWrapper.setAttribute('id', 'exportForm');
	exportDateFormWrapper.setAttribute("style", "width: 250px; margin: 5px auto; display: none");
	exportDateFormWrapper.innerText = "Activity start time:";
	exportDateFormWrapper.appendChild(exportForm);

	exportButton.parentElement.appendChild(exportDateFormWrapper);

	exportForm.addEventListener("submit", requestExportActivity);

	exportButton.addEventListener("click", (event) => exportDateFormWrapper.style.display = "block");

}

installExportButton();