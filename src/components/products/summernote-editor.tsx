"use client";

import { useEffect, useRef } from "react";

import { ApiError } from "@/lib/api/client";
import {
  uploadSummernoteFile,
  uploadSummernoteImage,
} from "@/lib/api/files";
import type { SummernoteOptions } from "@/types/summernote";

type SummernoteEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onUploadError?: (message: string) => void;
};

function isSummernoteInitialized($editor: JQuery<HTMLElement>) {
  return $editor.next(".note-editor").length > 0;
}

function cleanupSummernoteArtifacts($: JQueryStatic, $editor: JQuery<HTMLElement>) {
  if (isSummernoteInitialized($editor)) {
    $editor.summernote("destroy");
  }
  // React 재마운트 후 남은 팝오버/모달이 offset().top 계산 시 터지는 것 방지
  $(".note-popover, .note-modal, .note-tooltip").remove();
}

export function SummernoteEditor({
  value,
  onChange,
  placeholder = "상품 상세 정보를 입력하세요.",
  minHeight = 320,
  onUploadError,
}: SummernoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onUploadErrorRef = useRef(onUploadError);
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onUploadErrorRef.current = onUploadError;
  }, [onUploadError]);

  useEffect(() => {
    let cancelled = false;

    async function initEditor() {
      const el = editorRef.current;
      if (!el) return;

      const $ = (await import("jquery")).default;
      window.jQuery = $;
      window.$ = $;

      // jQuery 4+ 호환: Summernote 내부에서 $.now() 사용
      if (typeof $.now !== "function") {
        $.now = Date.now;
      }

      await import("summernote/dist/summernote-lite.css");
      // 언어팩은 summernote 본체 로드 후에 불러와야 $.summernote.lang 접근 가능
      await import("summernote/dist/summernote-lite.min.js");
      await import("summernote/dist/lang/summernote-ko-KR.min.js");

      if (cancelled || !editorRef.current) return;

      const $editor = $(el);

      if (isSummernoteInitialized($editor)) {
        cleanupSummernoteArtifacts($, $editor);
      }

      const handleUploadError = (err: unknown) => {
        const message =
          err instanceof ApiError
            ? err.message
            : "파일 업로드 중 오류가 발생했습니다.";
        onUploadErrorRef.current?.(message);
      };

      const uploadImages = (files: FileList | File[]) => {
        Array.from(files).forEach((file) => {
          uploadSummernoteImage(file)
            .then(({ url }) => {
              $editor.summernote("insertImage", url);
            })
            .catch(handleUploadError);
        });
      };

      const options: SummernoteOptions = {
        placeholder,
        height: minHeight,
        lang: "ko-KR",
        tabsize: 2,
        dialogsInBody: true,
        toolbar: [
          ["font", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture", "attachFile"]],
          ["view", ["codeview"]],
        ],
        buttons: {
          attachFile: ($context) => {
            const ui = $.summernote.ui;
            return ui
              .button({
                contents: '<i class="note-icon-link"></i>',
                tooltip: "파일 첨부",
                click: () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept =
                    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.hwp,image/*";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;

                    uploadSummernoteFile(file)
                      .then(({ url }) => {
                        const fileName = file.name.replace(/"/g, "'");
                        $context.summernote(
                          "pasteHTML",
                          `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${fileName}</a></p>`,
                        );
                      })
                      .catch(handleUploadError);
                  };
                  input.click();
                },
              })
              .render();
          },
        },
        callbacks: {
          onChange: (contents) => {
            onChangeRef.current(contents);
          },
          onImageUpload: (files) => {
            uploadImages(files);
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
    // Summernote는 마운트 시 1회만 초기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, placeholder]);

  return (
    <div className="summernote-wrapper rounded-lg border border-neutral-200 bg-white">
      <div ref={editorRef} />
    </div>
  );
}
