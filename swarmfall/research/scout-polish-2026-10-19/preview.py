"""CPU projection of exported real mesh geometry; not browser/GPU visual acceptance."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
OLD = ROOT / 'archive/scout-polish-2026-10-19'

def font(size):
    return ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', size)

def render(data, size=(620, 330), yaw=.65, pitch=.65, zoom=230):
    w, h = size
    color = np.zeros((h, w, 3), dtype=float) + np.array([.055, .075, .105])
    depth = np.full((h, w), -np.inf)
    forward = np.array([np.sin(yaw)*np.cos(pitch), np.sin(pitch), np.cos(yaw)*np.cos(pitch)])
    right = np.array([np.cos(yaw), 0, -np.sin(yaw)])
    up = np.cross(forward, right)
    basis = np.stack([right, up, forward], axis=1)
    light = np.array([-.4, .85, .6]); light /= np.linalg.norm(light)
    parts = [data['body'], data['glow']]
    # The renderer creates separate translucent rotor discs; their static outlines here
    # show anchor/clearance context only, not spinning rotors or game transparency.
    image = Image.fromarray((color*255).astype('uint8'))
    for part_index, part in enumerate(parts):
        xyz = np.array(part['positions']).reshape(-1, 3, 3)
        normals = np.array(part['normals']).reshape(-1, 3, 3)
        colors = np.array(part['colors']).reshape(-1, 3, 3)
        projected = xyz @ basis
        projected[:, :, 0] = w/2 + projected[:, :, 0]*zoom
        projected[:, :, 1] = h/2 + 14 - projected[:, :, 1]*zoom
        for tri, ns, cs in zip(projected, normals, colors):
            if np.mean(ns, axis=0) @ forward <= 0: continue
            x0=max(0,int(np.floor(tri[:,0].min()))); x1=min(w-1,int(np.ceil(tri[:,0].max())))
            y0=max(0,int(np.floor(tri[:,1].min()))); y1=min(h-1,int(np.ceil(tri[:,1].max())))
            if x1<x0 or y1<y0: continue
            xx, yy = np.meshgrid(np.arange(x0,x1+1)+.5, np.arange(y0,y1+1)+.5)
            a,b,c=tri
            denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(denominator)<1e-8: continue
            wa=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/denominator
            wb=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/denominator
            wc=1-wa-wb
            z=wa*a[2]+wb*b[2]+wc*c[2]
            current=depth[y0:y1+1,x0:x1+1]
            mask=(wa>=0)&(wb>=0)&(wc>=0)&(z>current)
            normal=np.mean(ns,axis=0); normal/=max(1e-8,np.linalg.norm(normal))
            shade=.34+.66*max(0,normal@light)
            rgb=np.mean(cs,axis=0)*shade
            if part_index: rgb=np.array([.17,.82,1.]) # canonical cyan, not squad animation
            # Linear vertex colors to display sRGB; simple Lambert light, no PBR/shadows.
            rgb=np.where(rgb<=.0031308,rgb*12.92,1.055*np.maximum(rgb,0)**(1/2.4)-.055)
            color[y0:y1+1,x0:x1+1][mask]=np.clip(rgb,0,1)
            current[mask]=z[mask]
    image=Image.fromarray((color*255).astype('uint8')); draw=ImageDraw.Draw(image)
    for x,y,z,r in data['rotors']:
        angle=np.linspace(0,2*np.pi,65)
        points=np.stack([x+r*np.cos(angle),np.full_like(angle,y),z+r*np.sin(angle)],axis=1)@basis
        draw.line([(w/2+a*zoom,h/2+14-b*zoom) for a,b,_ in points], fill=(77,108,127),width=1)
    return image

before=json.loads((OLD/'baseline-geometry.json').read_text())
after=json.loads((OUT/'scout-geometry.json').read_text())
canvas=Image.new('RGB',(1280,1010),(14,19,27)); draw=ImageDraw.Draw(canvas)
draw.text((24,14),'Scout | original and first polish pass',font=font(25),fill='#e0eaf0')
draw.text((24,53),'CPU mesh preview - fixed scale/light; not a browser screenshot or GPU benchmark',font=font(17),fill='#9bafc2')
for col,(label,data) in enumerate([('Original',before),('Polish pass',after)]):
    x=col*640+10
    draw.text((x+14,91),label,font=font(22),fill='#66d6ec')
    for y,pitch,caption in [(125,.55,'Close view'),(490,1.15,'Elevated view')]:
        canvas.paste(render(data,pitch=pitch),(x,y))
        draw.text((x+14,y+307),caption,font=font(17),fill='#b8c8d7')
    canvas.paste(render(data,size=(620,110),pitch=.8,zoom=35),(x,850))
    draw.text((x+14,961),'Small silhouette sample (not a calibrated RTS camera)',font=font(15),fill='#a0b2c5')
canvas.save(OUT/'comparison.png')
render(before).save(OLD/'original-cpu-preview.png')
print('Saved comparison.png and archived original-cpu-preview.png')
