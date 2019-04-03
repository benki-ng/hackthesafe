import requests
import time
from gpiozero import LED
import picamera
import datetime

#Define the pins, note this is the GPIO number not the pin number
statusLed = LED(17)
unlockedLed = LED(27)
unlockDoor = LED(4)

#Define camera setup
camera = picamera.PiCamera()
camera.resolution = (640, 480)

while True:
    try:
        r = requests.get('http://hackthesafe.benki.ng:3000/letmein')
        print(r.text)

        #Check that the site is reachable and set status led to on if it is.
        if r.status_code == 200:
            statusLed.on()

        #If the response contains the correct text, unlock the door and start recording camera.
        if r.text == "True":
            print('Door unlocked')
            unlockedLed.on()
            unlockDoor.on()
            camera.start_recording('video/' + datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S") + '.h264')
            camera.wait_recording(30)
            camera.stop_recording()
        else:
            print(r.text)
            unlockedLed.off()
            unlockDoor.off()

        statusLed.off()
        time.sleep(2)
    
    except:
        print("An exception occured")
