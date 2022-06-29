# Localization Guide

## Adding Locales Data

To change the language of labels used in the application, open VS Code on the Client App and navigate to the 
tabs -> public -> locales folder.

![](img/image_001.png)

Copy the en-GB folder and rename this folder to the required language e.g. en-US.

Once this is done, replace the values in the two common.json and shared.json files with the applicable language strings.

![](img/image_002.png)

Where there is embedded replacement strings like **{{entity}}** leave this as is. These placeholders will be replaced by other language strings.

Save the files when done editing and via the Teams Toolkit deploy the latest version to the cloud

![](img/image_003.png)