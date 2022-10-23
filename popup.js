function UnsavedChanges()
{
	document.getElementById('save').innerHTML = 'Save*';
}

function GetChosenSettings()
{
	let settings = {};
	
	// All the checkboxes
	document.querySelectorAll('input[type=checkbox]').forEach(function(checkbox)
	{
		settings[checkbox.id] = checkbox.checked;
	});
	
	// Now the radios
	document.querySelectorAll('input[type=radio]:checked').forEach(function(radioChecked)
	{
		// A bit cheeky, converting all the values to numbers, but there is only one radio group...
		settings[radioChecked.getAttribute('name')] = +radioChecked.value;
	});
	
	return settings;
}

function SetChosenSettings(settings)
{
	Object.entries(settings).forEach(function(property)
	{
		console.log(property);
		let element = document.getElementById(property[0]);
		if (element)
			element.checked = property[1];
		else
		{
			// We'll just assume that it's a radio if it can't find an element with that id
			radios = document.querySelectorAll('input[type=radio][name='+property[0]+']')
			for (let i = 0; i < radios.length; i++)
			{
				console.log(radios[i]);
				if (radios[i].value == property[1].toString())
				{
					radios[i].checked = true;
					break;
				}
			}
		}
	});
}

function SaveSettings(settings)
{
	const saveButton = document.getElementById('save');
	saveButton.innerHTML = 'Saving...';
	
	g_settings = settings;
	/*	chrome.storage.sync doesn't work for some reason, at least on my browser, and the
		extra functionality isn't really the most important thing in the world */
	chrome.storage.local.set({ "settings": settings }, function()
	{
		if (!chrome.runtime.lastError)
		{
			saveButton.innerHTML = 'Save';
			console.log('Saved settings '+JSON.stringify(settings));
		} else
			console.error('Failed to save settings.');
	});
}

function SaveChosenSettings()
{
	SaveSettings(GetChosenSettings());
}

function ResetSettings()
{
	console.log('Resetting settings...');
	
	const defaultSettings = {
		"ratingsMainList": true,
		"authorMainList": true,
		"fixCss": true,
		"articleFlavorText": true,
		"logLevel": 1
	};
	
	SetChosenSettings(defaultSettings);
	UnsavedChanges();
}

// MAIN EXECUTION STARTS HERE
document.addEventListener('DOMContentLoaded', function()
{
	// Getting the current settings
	chrome.storage.local.get('settings', function(data)
	{
		if (!chrome.runtime.lastError)
		{
			if (data && data.settings)
			{
				console.log('Loaded settings '+JSON.stringify(data.settings));
				SetChosenSettings(data.settings);
			} else
			{
				console.log('Resetting settings, as no saved settings were found.');
				ResetSettings();
			}
			
			document.getElementById('loading').style.display = 'none';
			document.getElementById('page').style.display = 'inline';
		} else
			console.error('Failed to get current settings.');
	});
	
	// Add the event listeners
	document.querySelectorAll('input[type=checkbox],input[type=radio]').forEach(function(input)
	{
		input.addEventListener('click', UnsavedChanges);
	});
	
	// I would do this in the HTML using onclick, but that causes weird security issues apparently
	document.getElementById('save').addEventListener('click', SaveChosenSettings);
	document.getElementById('reset').addEventListener('click', ResetSettings);
});
