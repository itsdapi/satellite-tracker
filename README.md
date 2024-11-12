# Satellite Tracker

> Powered by THREE.js, Next.js 14, with blazing fast speed (sort of..) 😎

![Overview](https://github.com/user-attachments/assets/549c67d1-c0f5-42c2-a834-e3af42fa0986)


![Focus view](https://github.com/user-attachments/assets/be735586-f280-4016-8bde-e69e8fff0eaf)

When focus it looks like this


This is a small project when I am working on my Lab Project, which is making a satellite tracker to be displayed on a big screen.
This project was inspired by [satellite tracker 3d](https://satellitetracker3d.com/) which definitely need to check out because it it so cool.

You might notice that there are some extra pages. That are my experiment pages. I am learning THREE.js by doing this project. 

The `globe` page is used to build the earth

The `learn-camera` page is used to learn how to control the camera

I also built some helper function `lookAtSatellite()`, which is super cool. Because this project was working on a NASA like ground station big screen monitor.
Which is design to operate autonomous. When there is satellite passing, I need to highlight it on the screen, which I need to autofocus it. So I need a algorithm 
to fly the camera to where the satellite is. Here is what I have done. First calculate the vector from the earth center to the sat, and then extend the vec, 
add a option to adjust the phi, theta offset, calculate the extended vec, apply that position to the camera. (lol can't describe it in eng, I learn my math in Chinese)

So I thought it was pretty good to keep it as it if it could help somebody.

## Features

- Fully controlled: No third party library, just pure THREE.js.
- Cached Sat Data: The satellite data is cached in the server, so it will not be calculated every time the page is loaded.
- Controllable line thickness: You can control the line thickness of the satellite orbit.

## TODO

- Use Point cloud to render the satellite instead of using a sphere.
- Add interactive control to the satellite.


