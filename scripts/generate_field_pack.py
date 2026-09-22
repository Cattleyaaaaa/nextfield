from pathlib import Path
import shutil

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "NEXTFIELD-Field-Pack.pdf"
PUBLIC = ROOT / "public" / "downloads" / "NEXTFIELD-Field-Pack.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
PUBLIC.parent.mkdir(parents=True, exist_ok=True)

font_candidates = [
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\simhei.ttf"),
    Path(r"C:\Windows\Fonts\arial.ttf"),
]
font_path = next(path for path in font_candidates if path.exists())
pdfmetrics.registerFont(TTFont("NF", str(font_path), subfontIndex=0))

W, H = A4
INK = HexColor("#0D252C")
PAPER = HexColor("#F0F5F4")
MUTED = HexColor("#66858A")
ACCENT = HexColor("#227783")
FOAM = HexColor("#9DE5E2")
LINE = HexColor("#BDD3D5")

c = canvas.Canvas(str(OUTPUT), pagesize=A4)
c.setTitle("NEXTFIELD Field Pack")
c.setAuthor("NEXTFIELD")
c.setFillColor(PAPER)
c.rect(0, 0, W, H, stroke=0, fill=1)

# Identity rail
c.setFillColor(INK)
c.rect(0, 0, 62, H, stroke=0, fill=1)
c.saveState()
c.translate(32, 48)
c.rotate(90)
c.setFont("NF", 8)
c.setFillColor(FOAM)
c.drawString(0, 0, "NEXTFIELD / FIELD PACK / 2026")
c.restoreState()

left = 88
right = W - 38
c.setFont("NF", 8)
c.setFillColor(ACCENT)
c.drawString(left, H - 54, "AGENT PRODUCT + FULL-STACK DELIVERY")
c.setFont("NF", 31)
c.setFillColor(INK)
c.drawString(left, H - 101, "NEXTFIELD")
c.setFont("NF", 13)
c.setFillColor(MUTED)
c.drawString(left, H - 124, "A living index of projects, notes and experiments.")

c.setStrokeColor(LINE)
c.line(left, H - 148, right, H - 148)

def section_label(y, text):
    c.setFont("NF", 7)
    c.setFillColor(ACCENT)
    c.drawString(left, y, text.upper())

def wrapped(text, x, y, width, font_size=9, leading=14, color=MUTED):
    c.setFont("NF", font_size)
    c.setFillColor(color)
    line = ""
    cursor = y
    for token in text.split(" "):
        trial = (line + " " + token).strip()
        if c.stringWidth(trial, "NF", font_size) > width and line:
            c.drawString(x, cursor, line)
            cursor -= leading
            line = token
        else:
            line = trial
    if line:
        c.drawString(x, cursor, line)
    return cursor - leading

section_label(H - 174, "Position")
c.setFont("NF", 18)
c.setFillColor(INK)
c.drawString(left, H - 201, "把 AI 能力，变成真正好用的产品。")
wrapped("I connect Agent architecture, interaction states and production engineering - from the workflow beneath the surface to the interface people can understand and control.", left, H - 225, right - left, 9, 14)

section_label(H - 276, "Selected systems")
projects = [
    ("01", "Knowledge Copilot", "Cited retrieval, tool use and recoverable workflows."),
    ("02", "Agent Operations", "Observation, debugging and evaluation for complex runs."),
    ("03", "Semantic Search", "Intent-aware retrieval over structured business data."),
]
y = H - 300
for number, title, detail in projects:
    c.setFillColor(FOAM)
    c.roundRect(left, y - 39, 30, 30, 15, stroke=0, fill=1)
    c.setFont("NF", 8)
    c.setFillColor(INK)
    c.drawCentredString(left + 15, y - 28, number)
    c.setFont("NF", 11)
    c.drawString(left + 42, y - 18, title)
    c.setFont("NF", 8)
    c.setFillColor(MUTED)
    c.drawString(left + 42, y - 34, detail)
    y -= 52

section_label(H - 475, "Evidence")
evidence = [
    ("AGENT PRODUCT", "State graphs, tools, confirmations, recovery paths"),
    ("FULL-STACK", "Next.js, TypeScript, MDX, static production delivery"),
    ("INTERACTION", "GSAP, Canvas, spatial feedback, accessible fallbacks"),
    ("EVALUATION", "Failure categories, traces, explicit evidence links"),
]
y = H - 499
col_w = (right - left - 16) / 2
for index, (title, detail) in enumerate(evidence):
    col = index % 2
    row = index // 2
    x = left + col * (col_w + 16)
    yy = y - row * 68
    c.setStrokeColor(LINE)
    c.roundRect(x, yy - 48, col_w, 50, 8, stroke=1, fill=0)
    c.setFont("NF", 8)
    c.setFillColor(ACCENT)
    c.drawString(x + 11, yy - 16, title)
    wrapped(detail, x + 11, yy - 32, col_w - 22, 7.5, 11)

section_label(181, "Working principles")
principles = ["Content before decoration", "Motion with an exit", "Build, observe, refine"]
for index, text in enumerate(principles):
    x = left + index * ((right - left) / 3)
    c.setFont("NF", 16)
    c.setFillColor(ACCENT)
    c.drawString(x, 151, f"0{index + 1}")
    c.setFont("NF", 8)
    c.setFillColor(INK)
    c.drawString(x, 132, text)

c.setStrokeColor(LINE)
c.line(left, 102, right, 102)
c.setFont("NF", 7)
c.setFillColor(MUTED)
c.drawString(left, 78, "NanChang / Remote")
c.drawRightString(right, 78, "github.com/Cattleyaaaaa")
c.setFillColor(ACCENT)
c.circle(right - 8, 42, 8, stroke=0, fill=1)
c.setFont("NF", 7)
c.setFillColor(INK)
c.drawCentredString(right - 8, 39.5, "NF")
c.save()

shutil.copyfile(OUTPUT, PUBLIC)
print(OUTPUT)
print(PUBLIC)
