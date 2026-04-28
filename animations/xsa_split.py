from manim import *
import numpy as np

VI_COLOR   = BLUE_C
VJ_COLORS  = [YELLOW, GREEN_C, RED_C]
PAR_COLOR  = ORANGE
PERP_COLOR = TEAL_C
CI_COLOR   = WHITE

SCALE  = 1.0
ORIGIN = LEFT * 4.0 + DOWN * 2.5


def pt(x, y):
    return ORIGIN + RIGHT * x * SCALE + UP * y * SCALE


def vec(start, end, color, width=4):
    return Arrow(start, end, buff=0, color=color, stroke_width=width,
                 max_tip_length_to_length_ratio=0.10, tip_length=0.18)


def draw_base(scene):
    x_ax   = vec(pt(-0.3, 0), pt(6.3, 0),  GREY_B, width=2)
    y_ax   = vec(pt(0, -0.3), pt(0,   6.3), GREY_B, width=2)
    vi_arr = vec(pt(0, 0), pt(2.5, 0), VI_COLOR, width=6)
    scene.play(Create(x_ax), Create(y_ax), GrowArrow(vi_arr), run_time=0.7)
    scene.wait(0.3)


def run_scenario(scene, vj_coords):
    xs    = [x for x, y in vj_coords]
    ys    = [y for x, y in vj_coords]
    sum_x = sum(xs)
    sum_y = sum(ys)

    vj_arrows = [vec(pt(0, 0), pt(x, y), c, width=4)
                 for (x, y), c in zip(vj_coords, VJ_COLORS)]
    scene.play(*[GrowArrow(a) for a in vj_arrows], run_time=0.8)
    scene.wait(0.35)

    dashes, par_arrs, perp_arrs = [], [], []
    for (x, y), color in zip(vj_coords, VJ_COLORS):
        d    = DashedLine(pt(x, y), pt(x, 0), color=color,
                          stroke_width=1.6, dash_length=0.1, stroke_opacity=0.55)
        parr = vec(pt(0, 0), pt(x, 0), PAR_COLOR,  width=3.5)
        perp = vec(pt(x, 0), pt(x, y), PERP_COLOR, width=3.5)
        dashes.append(d)
        par_arrs.append(parr)
        perp_arrs.append(perp)
        scene.play(Create(d), run_time=0.22)
        scene.play(GrowArrow(parr), GrowArrow(perp), run_time=0.45)

    scene.wait(0.25)
    scene.play(*[FadeOut(a) for a in vj_arrows],
               *[FadeOut(d) for d in dashes], run_time=0.35)

    x_cur = 0
    for idx, x in enumerate(xs):
        new = vec(pt(x_cur, 0), pt(x_cur + x, 0), PAR_COLOR, width=3.5)
        scene.play(ReplacementTransform(par_arrs[idx], new), run_time=0.38)
        par_arrs[idx] = new
        x_cur += x

    total_par = vec(pt(0, 0), pt(sum_x, 0), PAR_COLOR, width=6)
    scene.play(*[FadeOut(par_arrs[i]) for i in range(3)],
               GrowArrow(total_par), run_time=0.45)

    y_cur = 0
    for idx, y in enumerate(ys):
        new = vec(pt(sum_x, y_cur), pt(sum_x, y_cur + y), PERP_COLOR, width=3.5)
        scene.play(ReplacementTransform(perp_arrs[idx], new), run_time=0.38)
        perp_arrs[idx] = new
        y_cur += y

    total_perp = vec(pt(sum_x, 0), pt(sum_x, sum_y), PERP_COLOR, width=6)
    scene.play(*[FadeOut(perp_arrs[i]) for i in range(3)],
               GrowArrow(total_perp), run_time=0.45)
    scene.play(total_perp.animate.shift(LEFT * sum_x * SCALE), run_time=0.8)

    ci_arr = vec(pt(0, 0), pt(sum_x, sum_y), CI_COLOR, width=5)
    scene.play(GrowArrow(ci_arr), run_time=0.6)
    scene.wait(1.2)


class SeedAligned(Scene):
    def construct(self):
        draw_base(self)
        run_scenario(self, [(2.0, 0.6), (1.7, 0.7), (1.8, 0.5)])


class SeedBalanced(Scene):
    def construct(self):
        draw_base(self)
        run_scenario(self, [(0.65, 1.9), (1.25, 1.3), (1.9, 0.65)])


class SeedPerpendicular(Scene):
    def construct(self):
        draw_base(self)
        run_scenario(self, [(0.6, 2.0), (0.7, 1.7), (0.5, 1.8)])
