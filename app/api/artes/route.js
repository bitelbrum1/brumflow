export async function POST(req) {
  try {
    const { produto, texto, formato, estilo } = await req.json();

    if (!produto || !texto) {
      return Response.json(
        { error: "Produto e texto principal são obrigatórios." },
        { status: 400 }
      );
    }

    const tamanho =
      formato === "story"
        ? "width=720&height=1280"
        : formato === "banner"
        ? "width=1280&height=720"
        : "width=1024&height=1024";

    const prompt = `
Arte publicitária profissional para rede social.
Produto: ${produto}.
Texto principal na imagem: ${texto}.
Estilo visual: ${estilo}.
Cores: preto, roxo, rosa, brilho neon.
Design moderno, premium, chamativo, limpo, alta qualidade.
Sem marcas famosas, sem logos reais.
`;

    const encodedPrompt = encodeURIComponent(prompt);

    const imagem = `https://image.pollinations.ai/prompt/${encodedPrompt}?${tamanho}&nologo=true&enhance=true&seed=${Date.now()}`;

    return Response.json({ imagem });
  } catch (error) {
    return Response.json(
      { error: "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}