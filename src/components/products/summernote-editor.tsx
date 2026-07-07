"use client";

import { useEffect, useRef } from "react";

import type { SummernoteOptions } from "@/types/summernote";

type SummernoteEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onBlockedAction?: (message: string) => void;
};

function isSummernoteInitialized($editor: JQuery<HTMLElement>) {
  return $editor.next(".note-editor").length > 0;
}

function cleanupSummernoteArtifacts($: JQueryStatic, $editor: JQuery<HTMLElement>) {
  if (isSummernoteInitialized($editor)) {
    $editor.summernote("destroy");
  }
  $(".note-popover, .note-modal, .note-tooltip").remove();
}

export function SummernoteEditor({
  value,
  onChange,
  placeholder = "상품 상세 정보를 입력하세요.",
  minHeight = 320,
  onBlockedAction,
}: SummernoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onBlockedActionRef = useRef(onBlockedAction);
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onBlockedActionRef.current = onBlockedAction;
  }, [onBlockedAction]);

  useEffect(() => {
    let cancelled = false;

    async function initEditor() {
      const el = editorRef.current;
      if (!el) return;

      const $ = (await import("jquery")).default;
      window.jQuery = $;
      window.$ = $;

      if (typeof $.now !== "function") {
        $.now = Date.now;
      }

      await import("summernote/dist/summernote-lite.css");
      await import("summernote/dist/summernote-lite.min.js");
      await import("summernote/dist/lang/summernote-ko-KR.min.js");

      if (cancelled || !editorRef.current) return;

      const $editor = $(el);

      if (isSummernoteInitialized($editor)) {
        cleanupSummernoteArtifacts($, $editor);
      }

      const notifyBlocked = (message: string) => {
        onBlockedActionRef.current?.(message);
      };

      const options: SummernoteOptions = {
        placeholder,
        height: minHeight,
        lang: "ko-KR",
        tabsize: 2,
        dialogsInBody: true,
        disableDragAndDrop: true,
        toolbar: [
          ["font", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture"]],
          ["view", ["codeview"]],
        ],
        callbacks: {
          onChange: (contents) => {
            onChangeRef.current(contents);
          },
          onDrop: (event) => {
            event.preventDefault();
            notifyBlocked("파일 드래그 앤 드롭은 지원하지 않습니다. 이미지 URL을 입력해주세요.");
          },
          onPaste: (event) => {
            const originalEvent = event.originalEvent;
            if (!(originalEvent instanceof ClipboardEvent)) return;

            const clipboard = originalEvent.clipboardData;
            if (!clipboard) return;

            const hasImage = Array.from(clipboard.items).some((item) =>
              item.type.startsWith("image/"),
            );
            if (hasImage) {
              event.preventDefault();
              notifyBlocked(
                "이미지 붙여넣기는 지원하지 않습니다. '그림' 버튼에서 URL을 입력해주세요.",
              );
            }
          },
        },
      };

      $editor.summernote(options);
      $editor.summernote("code", value);

      destroyRef.current = () => {
        cleanupSummernoteArtifacts($, $editor);
      };
    }

    void initEditor();

    return () => {
      cancelled = true;
      destroyRef.current?.();
      destroyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, placeholder]);

  return (
    <div className="summernote-wrapper rounded-lg border border-neutral-200 bg-white">
      <div ref={editorRef} />
    </div>
  );
}
