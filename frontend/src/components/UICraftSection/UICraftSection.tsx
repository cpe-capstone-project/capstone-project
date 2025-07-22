import { useEffect } from "react";
import "./UICraftSection.css";

const UICraftSection = () => {
  useEffect(() => {
    const list = document.querySelector("ul");
    const items = list?.querySelectorAll("li");
    if (!list || !items) return;

    const setIndex = (event: any) => {
      const closest = event.target.closest("li");
      if (closest) {
        const index = [...items].indexOf(closest);
        const cols = new Array(items.length)
          .fill(null)
          .map((_, i) => {
            items[i].setAttribute("data-active", (index === i).toString());
            return index === i ? "10fr" : "1fr";
          })
          .join(" ");
        list.style.setProperty("grid-template-columns", cols);
      }
    };

    const resync = () => {
      const w = Math.max(
        ...[...items].map((i) => i.clientWidth)
      );
      list.style.setProperty("--article-width", w.toString());
    };

    list.addEventListener("click", setIndex);
    window.addEventListener("resize", resync);
    resync();

    return () => {
      list.removeEventListener("click", setIndex);
      window.removeEventListener("resize", resync);
    };
  }, []);

  return (
    <section className="ui-craft-section">
      <h1 className="fluid">the craft of ui</h1>
      <p>
        Unlock the art and science of interface development. This isn’t just about
        pushing pixels or following documentation — it’s about mastering the
        tools, understanding the nuances, and shaping experiences with intention.
      </p>
      <ul>
        {/* ตัวอย่างแค่ 1 รายการ */}
        <li data-active="true">
          <article>
            <h3>The Craft</h3>
            <p>
              Gain the confidence to build anything you envision, transforming
              motion, interaction, and design principles into second nature.
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12l4 6-10 13L2 9Z" />
              <path d="M11 3 8 9l4 13 4-13-3-6" />
              <path d="M2 9h20" />
            </svg>
            <a href="#"><span>Watch now</span></a>
            <img src="https://picsum.photos/720/720?random=12" alt="" />
          </article>
        </li>
        {/* เพิ่ม li ได้ตามต้องการ */}
      </ul>
    </section>
  );
};

export default UICraftSection;
