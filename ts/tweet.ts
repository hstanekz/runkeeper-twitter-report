class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text.toLowerCase(); // checking for case sensitivity
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.includes("completed")) {
            return 'completed_event';
          } else if (this.text.includes("achieved")) {
            return 'achievement';
          } else if (this.text.includes("posted")) {
            return 'live_event';
          } else if (this.text.includes("watch")) {
            return 'miscellaneous';
          }
        return "unknown";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        return !this.text.includes("check it out!");
    }
    

    get writtenText(): string {
        return this.written ? this.text : "";
    }
    

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        // Parse the activity type from the text of the tweet
        const activities = ["walk", "swim", "elliptical", "hike", "bike", "ski", "run", "chair ride", ];

        for (const activity of activities) {
            if (this.text.includes(activity)) {
                return activity;
            }
        }
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        // Parse the distance from the text of the tweet
        const regex = /(\d+\.\d+|\d+)\s*(mi|km)/;
        const match_text = this.text.match(regex);

        if (!match_text) {
            return 0; // No match found
        }

        // Extract regex values
        const distance = parseFloat(match_text[1]);
        const units = match_text[2].toLowerCase();

        // Unit conversion to miles
        if (units == 'km') {
            return distance / 1.609;
        } else {
            return distance;
        }
        

        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
        const clickableLink = this.text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');


        return `<tr>
        <td>${rowNumber}</td>
        <td>${this.activityType}</td>
        <td>${clickableLink}</td>
      </tr>`;
    }
}
