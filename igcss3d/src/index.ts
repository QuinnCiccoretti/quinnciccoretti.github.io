async function requestHTTP(url:string):Promise<string>{
	var request = new XMLHttpRequest();
	return new Promise( (resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) return;
			if (request.status >= 200 && request.status < 300) {
				resolve(request.responseText);
			} else {
				reject({
					status: request.status,
					statusText: request.statusText
				});
			}

		};
		request.open('GET', url, true);
		request.send();

	});
};

function processIgEmbedResponse(response:string):ChildNode{
	var parsed_resp = JSON.parse(response);
	console.log(parsed_resp);
	var el = document.createElement('div');
	el.innerHTML =  parsed_resp.html;
	return <ChildNode>el.firstChild;
	
}
const vidurl= "http://api.instagram.com/oembed/?maxwidth=350&omitscript=true&url=http://www.instagram.com/p/";

const imgurl1 = "https://instagram.com/p/";
const imgurl2 = "/media/?size=m";
// though this returns the right element, you must call 
// instgrm.Embeds.process(); elsewhere for videos to render!
// images need no call to embeds
export async function parseEntry(post:[string, boolean]):Promise<ChildNode>{
	if(post[1]){	//if it is a video
		//use the oembed api
		var embedResponseText = await requestHTTP(vidurl + post[0]);
		return processIgEmbedResponse(embedResponseText);
	}
	else{	//if it is an image
		var img = document.createElement('img');
		img.src = imgurl1 + post[0] + imgurl2;
		return img;
	}
}