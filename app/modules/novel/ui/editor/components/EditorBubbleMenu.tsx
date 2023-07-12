import { BubbleMenu, BubbleMenuProps } from "@tiptap/react";
import clsx from "clsx";
import { FC, useRef, useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  ImageIcon,
} from "lucide-react";

import { NodeSelector } from "./NodeSelector";
import { ColorSelector } from "./ColorSelector";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: any;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children">;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const inputRef = useRef();
  const items: BubbleMenuItem[] = [
    {
      name: "bold",
      isActive: () => props.editor.isActive("bold"),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: () => props.editor.isActive("italic"),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: () => props.editor.isActive("underline"),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: () => props.editor.isActive("strike"),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: () => props.editor.isActive("code"),
      command: () => props.editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ editor }) => {
      // don't show if image is selected
      if (editor.isActive("image")) {
        return false;
      }
      return editor.view.state.selection.content().size > 0;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsColorSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);

  const addImage = (url: string) => {
    if (url) {
      props.editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleClick = (e: any) => {
    // 👇️ open file input box on click of another element
    e.preventDefault();
    inputRef.current.click();
  };

  const handleFileChange = (event: any) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    const url = URL.createObjectURL(fileObj);
    addImage(url);
    // 👇️ reset file input
    event.target.value = null;
  };

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="flex overflow-hidden rounded border border-stone-200 bg-white shadow-xl"
    >
      <NodeSelector
        editor={props.editor}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
          setIsColorSelectorOpen(false);
        }}
      />

      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.command}
          type="button"
          className="p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200"
        >
          <item.icon
            className={clsx("h-4 w-4", {
              "text-blue-500": item.isActive(),
            })}
          />
        </button>
      ))}

      <input
        style={{ display: "none" }}
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
      />

      <button onClick={handleClick}>
        <ImageIcon />
      </button>

      <ColorSelector
        editor={props.editor}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
        }}
      />
    </BubbleMenu>
  );
};
