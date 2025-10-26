# Image Plugin Events

The **Image Plugin** exposes JavaScript events that let your application intercept image uploads, process them through an external service, and update the image block once a final public URL is available.

These events enable a fully extensible upload–replace flow without modifying the editor’s core logic.

---

## Event: `guten:image-added`

This event is **automatically dispatched** whenever an image block is inserted — whether through **upload** or **embed**.

### Event Detail

```ts
interface ImageAddedEventDetail {
  blockId: string;                           // Unique identifier of the inserted block
  mediaType: "image";                        // Always "image" for this plugin
  sourceType: "data-url" | "external-url";   // Indicates if src is base64/data URL or an external HTTP(S) link
  src: string;                               // Current value of the <img> src attribute
  alt?: string;                              // Optional alternative text for the image
  dataset?: Record<string, string>;          // Custom data-* attributes applied to the block
  element: HTMLElement;                      // Direct reference to the <figure> element
}
```

### Example: Handling uploads and replacing the image source

The example below listens for the `guten:image-added` event, uploads the image to an external API, and then triggers a `guten:image-replace` event to update the image block with the final URL.

```ts
document.addEventListener("guten:image-added", async (event) => {
  const detail = (event as CustomEvent<ImageAddedEventDetail>).detail;
  if (!detail || detail.sourceType !== "data-url") return;

  // Example: send the base64 image to your API and get back a public URL
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blockId: detail.blockId,
      dataUrl: detail.src,
      alt: detail.alt,
    }),
  });

  if (!response.ok) return;
  const { publicUrl } = await response.json();

  // Ask the editor to replace the temporary image with the public URL
  document.dispatchEvent(new CustomEvent("guten:image-replace", {
    detail: {
      blockId: detail.blockId,
      url: publicUrl,
      alt: detail.alt,
    },
  }));
});
```

---

## Event: `guten:image-replace`

This event is **not** dispatched automatically by the editor.  
It exists so your application can tell the editor that a specific image block (identified by its `blockId`) should be updated with a new `src` value.

### Event Detail

```ts
interface ImageReplaceEventDetail {
  blockId: string;                  // The block ID previously returned in the "image-added" event
  url: string;                      // New value for the image src
  alt?: string;                     // (Optional) New alternative text
  dataset?: Record<string, string>; // (Optional) Custom data-* attributes to apply
}
```

### Example: Replacing an image later with extra metadata

```ts
document.dispatchEvent(new CustomEvent("guten:image-replace", {
  detail: {
    blockId: "block-123",
    url: "https://cdn.example.com/assets/image.jpg",
    alt: "New description",
    dataset: { assetId: "image-123" },
  },
}));
```

When the editor receives this event, it:
- Finds the matching `<figure>` element using the provided `blockId`.
- Updates the `<img>` `src` and `alt` attributes.
- Updates or merges the block’s `data-*` attributes.  
  If no `dataset` is provided, the existing custom attributes are preserved.

---

## Why this matters

These events make the image lifecycle fully **extensible**:
- The editor doesn’t need to know how your uploads are handled.
- You can connect the image workflow to **external APIs, cloud storage, or CDN services**.
- Updates happen seamlessly in the editor without additional dependencies.
