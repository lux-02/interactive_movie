import styles from "@/styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [responseTitle, setResponseTitle] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [options, setOptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [chapter, setChapter] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isInitial, setIsInitial] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsInitial(false);
    const newHistory = [...history, { role: "user", content: inputText }];
    const res = await fetch(`/api/gpt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: inputText, history: newHistory }),
    });
    const img = await fetch(`/api/dalle?text=${inputText}`);
    const data = await res.json();
    const imgData = await img.json();
    const formattedContent = formatStoryText(data.res);
    setResponseTitle(formattedContent.title);
    setResponseContent(formattedContent.story);
    setImgUrl(imgData.res);
    setOptions(formattedContent.options);
    setHistory([...newHistory, { role: "assistant", content: data.res }]);
    setChapter((prev) => prev + 1);
  };

  const handleOptionClick = async (option) => {
    setShowOptions(false);
    const newHistory = [...history, { role: "user", content: option }];
    const res = await fetch(`/api/gpt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: option, history: newHistory }),
    });
    const img = await fetch(`/api/dalle?text=${option}`);
    const data = await res.json();
    const imgData = await img.json();
    const formattedContent = formatStoryText(data.res);
    setResponseTitle(formattedContent.title);
    setResponseContent(formattedContent.story);
    setImgUrl(imgData.res);
    setOptions(formattedContent.options);
    setHistory([...newHistory, { role: "assistant", content: data.res }]);
    setChapter((prev) => prev + 1);
  };

  const formatStoryText = (text) => {
    const lines = text.split("\n").filter(Boolean);

    const title = lines
      .find((line) => line.startsWith("- 제목:"))
      .replace("- 제목:", "")
      .trim();
    const story = lines
      .find((line) => line.startsWith("- 내용:"))
      .replace("- 내용:", "")
      .trim();
    const options = lines
      .slice(2)
      .map((option) => option.replace(/^-\s*/, "").trim());

    return { title, story, options };
  };

  return (
    <div className={styles.wrap}>
      {isInitial && (
        <>
          <h1 className={`${styles.header} flexCenter`}>
            AI Generate Interactive Movie
          </h1>
          <form
            className={`${styles.inputWrap} flexCenter`}
            onSubmit={handleSubmit}
          >
            <input
              className={`${styles.inputBox} flexCenter`}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="만들고자 하는 키워드 및 스토리를 입력하세요."
            />
            <button className={`${styles.inputBtn}`} type="submit">
              Submit
            </button>
          </form>
        </>
      )}
      {responseContent && (
        <div className={styles.responseContainer}>
          <h3 className={` flexCenter ${styles.titleText}`}>
            #{chapter} {responseTitle}
          </h3>
          <img src={imgUrl} alt="DALL-E IMG" className={styles.responseImage} />
          <p className={`flexCenter ${styles.storyText}`}>{responseContent}</p>
          <button
            className={styles.showOptionsButton}
            onClick={() => setShowOptions(true)}
          >
            선택지 보기
          </button>
        </div>
      )}
      {showOptions && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowOptions(false)}
            >
              X
            </button>
            <h3>Next Story?</h3>
            {options.map((option, index) => (
              <button
                key={index}
                className={styles.optionButton}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
