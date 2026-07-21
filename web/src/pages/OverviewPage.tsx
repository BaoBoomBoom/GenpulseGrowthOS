import { Link } from "react-router-dom";
import { useStore } from "../store-context";

export function OverviewPage() {
  const { knowledge, topics, content, events } = useStore();
  const installs = events
    .filter((e) => e.event_type === "install")
    .reduce((s, e) => s + e.value, 0);
  const activations = events
    .filter((e) => e.event_type === "activation")
    .reduce((s, e) => s + e.value, 0);

  return (
    <>
      <header style={{ marginBottom: 8 }}>
        <h1 className="page-title">Genpulse AI Marketing OS</h1>
        <p className="page-desc">
          Phase 1 MVP：打通 Knowledge → Topic → Content → Attribution 最小闭环。
          不做 Content Calendar——先验证可追踪增长。
        </p>
      </header>

      <div className="grid-4" style={{ marginBottom: 18 }}>
        <div className="stat">
          <div className="label">Knowledge</div>
          <div className="value">{knowledge.length}</div>
        </div>
        <div className="stat">
          <div className="label">Topics</div>
          <div className="value">{topics.length}</div>
        </div>
        <div className="stat accent">
          <div className="label">Content assets</div>
          <div className="value">{content.length}</div>
        </div>
        <div className="stat signal">
          <div className="label">Installs / Act.</div>
          <div className="value">
            {installs}/{activations}
          </div>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h2>Phase 1 · 4 个核心模块</h2>
          <Link className="btn secondary" to="/topics">
            打开 Topic Engine
          </Link>
        </div>
        <div className="panel-body">
          <div className="loop">
            <Link to="/knowledge" className="loop-card kb" style={{ textDecoration: "none" }}>
              <div className="n">01</div>
              <h3>Knowledge Base</h3>
              <p>研究 · 产品 · FAQ · Founder Stories——结构化可引用知识底座</p>
            </Link>
            <Link to="/topics" className="loop-card topic" style={{ textDecoration: "none" }}>
              <div className="n">02</div>
              <h3>Topic Engine</h3>
              <p>目标 × 品牌 × 平台 → 带优先级的选题池</p>
            </Link>
            <Link to="/content" className="loop-card content" style={{ textDecoration: "none" }}>
              <div className="n">03</div>
              <h3>Content Generator</h3>
              <p>TikTok / IG / X / LinkedIn 同一主题多平台改写</p>
            </Link>
            <Link to="/dashboard" className="loop-card dash" style={{ textDecoration: "none" }}>
              <div className="n">04</div>
              <h3>Dashboard</h3>
              <p>曝光 · Clicks · Downloads · Activations · Uploads → 回流选题</p>
            </Link>
          </div>
          <div className="callout">
            每条内容携带 Topic ID、Brand、Platform、CTA 追踪 Link；
            Dashboard 用这些参数把业务结果挂回主题。
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>AMOS 地图 · Phase 1 范围 · 后期扩展</h2>
        </div>
        <div className="panel-body">
          <div className="amos-map">
            <div className="amos-col">
              <div className="amos-node">
                <h4>Knowledge Base</h4>
                <ul>
                  <li>Research / Products / FAQs</li>
                  <li>Founder Stories</li>
                </ul>
              </div>
              <div className="amos-node">
                <h4>Brand Memory</h4>
                <ul>
                  <li>Genpulse / Lushair / CEO voice</li>
                  <li>安全边界 · 禁语</li>
                </ul>
              </div>
              <div className="amos-node future">
                <h4>Market Signals · later</h4>
                <p>竞品内容 · 趋势 · 评论洞察 · 热词</p>
              </div>
            </div>

            <div className="amos-col">
              <div className="amos-node brain">
                <h4>Content Brain / Decision Engine</h4>
                <p>
                  选题优先级与平台格式决策——本期人工确认 / 规则打分——不做全自动。
                </p>
                <ul>
                  <li>AI Scientist → 证据与安全约束</li>
                  <li>AI Creative Director → 钩子与格式</li>
                  <li>AI Growth Manager → 目标与回流</li>
                </ul>
              </div>
              <div className="amos-node future">
                <h4>Creative / Video Studio · later</h4>
                <p>Image prompt · 分镜 · Thumbnail 生成——Phase 1 不做</p>
              </div>
            </div>

            <div className="amos-col">
              <div className="amos-node">
                <h4>Publishing · human in the loop</h4>
                <p>人工发布；系统只负责资产与追踪参数</p>
              </div>
              <div className="amos-node">
                <h4>Growth Loop</h4>
                <p>Click → Download → Activation → Upload → 下周 priority</p>
              </div>
              <div className="amos-node future">
                <h4>Auto Agent · later</h4>
                <p>周会 briefing 与自动选题建议</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
