# Satellite Tracker

> Powered by THREE.js, Next.js 14, with blazing fast speed (sort of...) 😎

![Overview](https://github.com/user-attachments/assets/549c67d1-c0f5-42c2-a834-e3af42fa0986)

![Focus view](https://github.com/user-attachments/assets/be735586-f280-4016-8bde-e69e8fff0eaf)

![In action](https://github.com/user-attachments/assets/895d41ff-5552-452c-85f8-4c485ced2b63)


This is a small project when I am working on my Lab Project, which is making a satellite tracker to be displayed on a big screen.
This project was inspired by [satellite tracker 3d](https://satellitetracker3d.com/) which definitely need to check out because it is so cool.

## How to play

There is a panel on top right, which has `trackSat` option. Set it to `-1` to disable tracking. Set to a number like from `0-9` would focus on a sat. 
The number is referred to the satellite index you're gonna to track, which is fetch by `fetchTles(10)`. Pass the amount of the satellite you want to fetch. 

There is `useEdgeEarth` option, which toggle whether to use the cool edges earth of just normal earth.

## Approach

Firstly it use `fetchTles()` to fetch tle data online. Then it is pass to `calculateBatchTlePositions()` to get the actual xyz position for rendering. 
Also, this function is using Next.js cache feature, and it is running on the server side, so all the calculation is not happening on the user client. 

There is a function call `geoToCartesian()` is worth mentioning. It used to convert geolocation to xyz position. So basically you could add anything to the globe by 
using this function. 

About the edges earth. Firstly, credit to [Robot Bobby](https://www.youtube.com/@robotbobby9), go check out his YouTube threejs tutorial, which is excellent. 
And the land GeoJson data is coming from [Natural Earth](https://github.com/martynafford/natural-earth-geojson). 
All the boundary drawing on the map is done by this lib [ThreeGeoJSON](https://github.com/bobbyroe/ThreeGeoJSON/tree/three-v170).


So I thought it was pretty good to keep it as it if it could help somebody.

## Features

- Fully controlled: No third party library, just pure THREE.js.
- Cached Sat Data: The satellite data is cached in the server, so it will not be calculated every time the page is loaded.
- Controllable line thickness: You can control the line thickness of the satellite orbit.

## TODO

- Use Point cloud to render the satellite instead of using a sphere.
- Add interactive control to the satellite.

> 地图中出现的中国边界资料收集自互联网


