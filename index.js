const fs = require('fs');
const { toXML } = require('jstoxml');
const { getDefaultSettings } = require('http2');
const { info } = require('console');

// directory path
const dir = 'episodes';
let items = [];

function getSummary(description) {
	return description.split('\n').filter(p => p !== '').map(p => `<p>${p}</p>`).join('');
}

function getDate(uploadDate) {
	const year = parseInt(uploadDate.substr(0, 4));
	const month = parseInt(uploadDate.substr(4, 2)) - 1;
	const day = parseInt(uploadDate.substr(6, 2));
	const date = new Date(year, month, day);

	const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
	const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
	return `${weekday}, ${day} ${monthName} ${year} 00:00:00 +0000`;
}

function pad(number) {
	return ('0' + number).slice(-2);
}

function getDuration(duration) {
	const seconds = duration % 60;
	let minutes = Math.floor(duration / 60);
	const hours = Math.floor(minutes / 60);
	minutes = minutes % 60;
	if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
	return pad(seconds);
}

function getPodcastUrl(info) {
	return `http://wanshow.brams.dev/episode/${info._filename}`;
}

function getContentLength() {
	return info.filesize;
}

function getGUID(info) {
	return `${getPodcastUrl(info)}?${info.filesize}`;
}

function getItemFromPodcast(podcast) {
	return {
		item: [
			{
				title: podcast.title
			},
			{
				'itunes:author': podcast.author
			},
			{
				'itunes:subtitle': podcast.subtitle
			},
			{
				'itunes:summary': podcast.summary
			},
			{
				'itunes:image': podcast.image
			},
			{
				_name: 'enclosure',
				_attrs: {
					url: podcast.url,
					length: podcast.contentLength,
					type: podcast.type
				}
			},
			{
				guid: podcast.guid
			},
			{
				pubDate: podcast.date
			},
			{
				'itunes:duration': podcast.duration
			}
		]
	}
}

function getXML(items) {
	const xmlOptions = {
		header: true,
		indent: '	'
	};

	return toXML({
		_name: 'rss',
		_attrs: {
			'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
			version: '2.0'
		},
		_content: {
			channel: [
				{
					title: 'The WAN Show Podcast'
				},
				{
					link: 'https://www.youtube.com/playlist?list=PLlr-m6aT0bkemifaU7ohKVJt3CAfr7nw8'
				},
				{
					language: 'en-us'
				},
				{
					copyright: ''
				},
				{
					'itunes:subtitle': 'The WAN Show Podcast'
				},
				{
					'itunes:author': 'Linus Tech Tips'
				},
				{
					'itunes:summary': 'Every week Linus and Luke discuss the most current happenings in the technology universe.'
				},
				{
					description: 'Every week Linus and Luke discuss the most current happenings in the technology universe.'
				},
				{
					'itunes:owner': {
						'itunes:name': 'Linus Sebastian',
						'itunes:email': 'info@linusmediagroup.com'
					}
				},
				{
					_name: 'itunes:image',
					_attrs: {
						href: 'https://ssl-static.libsyn.com/p/assets/3/e/e/a/3eeaed49a6b57573/WAN-iTunes-Square.jpg'
					}
				},
				{
					_name: 'itunes:category',
					_attrs: {
						text: 'News'
					},
					_content: {
						_name: 'itunes:category',
						_attrs: {
							text: 'Tech News'
						}
					}
				},
				{
					_name: 'itunes:category',
					_attrs: {
						text: 'Technology'
					}
				},
				{
					_name: 'itunes:category',
					_attrs: {
						text: 'Leisure'
					},
					_content: {
						_name: 'itunes:category',
						_attrs: {
							text: 'Video Games'
						}
					}
				},
				...items
			]
		}
	}, xmlOptions);
}

// list all files in the directory
fs.readdir(dir, (err, files) => {
	if (err) {
		throw err;
	}

	files = files.filter(file => {
		const parts = file.split('.');
		const ext = parts[parts.length - 1];
		return ext === 'json';
	}).sort();

	const podcasts = files.map(file => {		
		const info = JSON.parse(fs.readFileSync(dir + '\\' + file));

		return {
			title: info.title,
			author: 'Linus Tech Tips',
			subtitle: 'The WAN Show Podcast',
			summary: getSummary(info.description),
			image: 'https://ssl-static.libsyn.com/p/assets/3/e/e/a/3eeaed49a6b57573/WAN-iTunes-Square.jpg',
			date: getDate(info.upload_date),
			duration: getDuration(info.duration),
			url: getPodcastUrl(info),
			contentLength: getContentLength(info),
			type: 'audio/x-m4a',
			guid: getGUID(info),
			tags: info.tags && info.tags.toString() || ''
		};
	});

	items = podcasts.map(getItemFromPodcast);

	const xml = getXML(items);
	fs.writeFile('feed.xml', xml, (err) => {
		console.log('written');
		console.error(err);
	});
});