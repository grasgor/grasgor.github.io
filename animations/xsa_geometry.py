from manim import *
import numpy as np

VI_COLOR   = BLUE_C
VJ_COLORS  = [YELLOW, GREEN_C, RED_C]
PAR_COLOR  = ORANGE
PERP_COLOR = TEAL_C

# Graph sits left-of-centre; right half is free for the summary box.
SCALE  = 1.2
ORIGIN = LEFT * 3.8 + DOWN * 2.0


def pt(x, y):
    """Axis-units → scene coordinates."""
    return ORIGIN + RIGHT * x * SCALE + UP * y * SCALE


def vec(start, end, color, width=4):
    return Arrow(start, end, buff=0, color=color, stroke_width=width,
                 max_tip_length_to_length_ratio=0.18)


def caption(text, font_size=23):
    """Fixed-position subtitle that never overlaps the axes region."""
    return Text(text, font_size=font_size).move_to(DOWN * 3.4)


class XSAGeometry(Scene):
    def construct(self):
        vj_coords = [(0.65, 1.9), (1.25, 1.3), (1.9, 0.65)]
        xs      = [x for x, y in vj_coords]
        ys      = [y for x, y in vj_coords]
        sum_x   = sum(xs)   # 3.8
        sum_y   = sum(ys)   # 3.85

        # ── 0. Title ──────────────────────────────────────────────────────────
        title = MathTex(
            r"\text{Geometric view:}\quad c_i = \!\sum_{j \ne i} a_{ij}\, v_j",
            font_size=32,
        ).to_edge(UP)
        self.play(Write(title))

        # ── 1. Axes ────────────────────────────────────────────────────────────
        x_ax  = vec(pt(-0.25, 0), pt(4.6, 0),  GREY_B, width=2)
        y_ax  = vec(pt(0, -0.25), pt(0,   4.6), GREY_B, width=2)
        x_lbl = MathTex(r"\hat{v}_i", font_size=20, color=GREY_B)
        x_lbl.next_to(pt(4.6, 0), DOWN + RIGHT * 0.5, buff=0.08)
        y_lbl = MathTex(r"\perp v_i", font_size=20, color=GREY_B)
        y_lbl.next_to(pt(0, 4.6), UP, buff=0.1)
        self.play(Create(x_ax), Create(y_ax), Write(x_lbl), Write(y_lbl))

        # ── 2. v_i ────────────────────────────────────────────────────────────
        vi_arr = vec(pt(0, 0), pt(2.5, 0), VI_COLOR, width=6)
        vi_lbl = MathTex(r"v_i", color=VI_COLOR, font_size=36)
        vi_lbl.next_to(pt(2.5, 0), DOWN, buff=0.2)
        cap0 = caption("vᵢ — our reference direction (horizontal)")
        self.play(GrowArrow(vi_arr), Write(vi_lbl), Write(cap0))
        self.wait(0.8)
        self.play(FadeOut(cap0))

        # ── 3. Three v_j context vectors ──────────────────────────────────────
        vj_arrows, vj_labels = [], []
        cap1 = caption("Context vectors vⱼ at varying orientations")
        self.play(Write(cap1))

        for idx, ((x, y), color) in enumerate(zip(vj_coords, VJ_COLORS)):
            arr = vec(pt(0, 0), pt(x, y), color, width=4)
            lbl = MathTex(rf"v_{{j_{idx+1}}}", color=color, font_size=27)
            lbl.next_to(pt(x, y), UL if y > x else UR, buff=0.1)
            vj_arrows.append(arr)
            vj_labels.append(lbl)
            self.play(GrowArrow(arr), Write(lbl), run_time=0.65)

        self.wait(0.7)
        self.play(FadeOut(cap1))

        # ── 4. Decompose each v_j ─────────────────────────────────────────────
        cap2 = caption("Decompose each vⱼ into ∥ and ⊥ parts w.r.t. vᵢ")
        self.play(Write(cap2))

        dashes, par_arrs, perp_arrs = [], [], []
        for idx, ((x, y), color) in enumerate(zip(vj_coords, VJ_COLORS)):
            d    = DashedLine(pt(x, y), pt(x, 0), color=color,
                              stroke_width=1.8, dash_length=0.1, stroke_opacity=0.6)
            parr = vec(pt(0, 0), pt(x, 0), PAR_COLOR,  width=3.5)
            perp = vec(pt(x, 0), pt(x, y), PERP_COLOR, width=3.5)
            dashes.append(d)
            par_arrs.append(parr)
            perp_arrs.append(perp)
            self.play(Create(d), run_time=0.28)
            self.play(GrowArrow(parr), GrowArrow(perp), run_time=0.55)

        self.wait(0.5)
        self.play(
            *[FadeOut(a) for a in vj_arrows],
            *[FadeOut(l) for l in vj_labels],
            *[FadeOut(d) for d in dashes],
            FadeOut(cap2),
        )

        # ── 5. Stack ∥ (orange) components end-to-end along x ────────────────
        cap3 = caption("Stack ∥ components end-to-end along x-axis")
        self.play(Write(cap3))

        x_cur = 0
        for idx, x in enumerate(xs):
            stacked = vec(pt(x_cur, 0), pt(x_cur + x, 0), PAR_COLOR, width=3.5)
            self.play(ReplacementTransform(par_arrs[idx], stacked), run_time=0.45)
            par_arrs[idx] = stacked
            x_cur += x

        self.play(FadeOut(cap3))

        # Collapse individual stacked arrows → one fat combined orange arrow
        total_par = vec(pt(0, 0), pt(sum_x, 0), PAR_COLOR, width=6)
        self.play(
            *[FadeOut(par_arrs[i]) for i in range(len(par_arrs))],
            GrowArrow(total_par),
        )
        beta_lbl = MathTex(r"\beta_i \|v_i\|", color=PAR_COLOR, font_size=26)
        beta_lbl.next_to(pt(sum_x / 2, 0), DOWN, buff=0.22)
        self.play(Write(beta_lbl))

        # ── 6. Stack ⊥ (teal) components at x=sum_x, then slide to y-axis ────
        cap4 = caption("Stack ⊥ components, then slide onto y-axis")
        self.play(Write(cap4))

        y_cur = 0
        for idx, y in enumerate(ys):
            stacked = vec(pt(sum_x, y_cur), pt(sum_x, y_cur + y), PERP_COLOR, width=3.5)
            self.play(ReplacementTransform(perp_arrs[idx], stacked), run_time=0.45)
            perp_arrs[idx] = stacked
            y_cur += y

        # Collapse individual stacked arrows → one fat combined teal arrow
        total_perp = vec(pt(sum_x, 0), pt(sum_x, sum_y), PERP_COLOR, width=6)
        self.play(
            *[FadeOut(perp_arrs[i]) for i in range(len(perp_arrs))],
            GrowArrow(total_perp),
        )
        self.wait(0.3)

        # Slide the combined teal arrow left onto the y-axis
        shift_left = LEFT * sum_x * SCALE
        self.play(total_perp.animate.shift(shift_left), run_time=0.9)

        r_lbl = MathTex(r"\|r_i\|", color=PERP_COLOR, font_size=26)
        r_lbl.next_to(pt(0, sum_y / 2), LEFT, buff=0.22)
        self.play(Write(r_lbl), FadeOut(cap4))

        # ── 7. Draw c_i ───────────────────────────────────────────────────────
        ci_arr = vec(pt(0, 0), pt(sum_x, sum_y), WHITE, width=5)
        ci_lbl = MathTex(r"c_i", color=WHITE, font_size=34)
        ci_lbl.next_to(pt(sum_x * 0.55, sum_y * 0.55), RIGHT, buff=0.15)
        self.play(GrowArrow(ci_arr), Write(ci_lbl))
        self.wait(0.4)

        # ── 8. Summary box — right side, well below title ─────────────────────
        box = RoundedRectangle(corner_radius=0.15, width=5.0, height=2.7, color=GREY_B)
        box.set_fill(color="#111111", opacity=0.93)
        box.move_to(RIGHT * 4.5 + DOWN * 0.3)   # right half, vertically centred

        lines = VGroup(
            MathTex(r"\text{Long } x,\ \text{short } y",
                    font_size=24, color=WHITE),
            MathTex(r"\Rightarrow\ \beta_i \text{ large},\ \|r_i\| \text{ small}",
                    font_size=24, color=PAR_COLOR),
            MathTex(r"\Rightarrow\ \cos(o_i,\, v_i) \approx 1",
                    font_size=24, color=VI_COLOR),
            MathTex(r"o_i\ \text{biased toward}\ v_i\ \text{(sink)}",
                    font_size=21, color=GREY_A),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        lines.move_to(box)

        self.play(FadeIn(box), LaggedStart(*[Write(l) for l in lines], lag_ratio=0.4))
        self.wait(3)
