export async function* iterateSseData(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
      if (line.length === 0) {
        if (dataLines.length > 0) {
          yield dataLines.join("\n");
          dataLines = [];
        }
        continue;
      }

      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
  }

  if (buffer.startsWith("data:")) {
    dataLines.push(buffer.slice(5).trimStart());
  }

  if (dataLines.length > 0) {
    yield dataLines.join("\n");
  }
}

