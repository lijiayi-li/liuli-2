"""从本地展柜原图生成网页照片；保留原图，不改变展品颜色。"""
from pathlib import Path
from PIL import Image, ImageOps
import sys
root=Path(__file__).resolve().parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else root/'assets/yellow-original.jpg'
image=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
w,h=image.size
boxes={
 'yellow-bell.jpg':(.17,.645,.395,.92),
 'yellow-display.jpg':(.15,.25,.94,.95),
 'yellow-panel.jpg':(.215,.26,.75,.48),
 'yellow-location.jpg':(.02,.48,.99,.99),
}
for name,box in boxes.items():
 target=root/'assets'/name
 image.crop(tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(box))).save(target,quality=97,subsampling=0,optimize=True)
 print(name,Image.open(target).size,target.stat().st_size)
