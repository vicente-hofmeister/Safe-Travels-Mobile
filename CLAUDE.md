# CLAUDE.md — Safe Travels Mobile

## Contexto do projeto

TCC de Sistemas de Informação (PUCRS) — Vicente Hofmeister.

Sistema colaborativo para compartilhamento de localização em tempo real durante viagens em grupo, com foco em conectividade limitada, segurança e privacidade.

Repositórios relacionados:
- [Safe-Travels-API](https://github.com/vicente-hofmeister/Safe-Travels-API) — local em `../Safe-Travels-API`
- [Safe-Travels-Wiki](https://github.com/vicente-hofmeister/Safe-Travels-Wiki)

Protótipo de telas (Figma): https://www.figma.com/design/K1rykzJuxcgNQqC5FVksnZ/TCC

---

## Stack e versões

### Ferramentas do sistema (instalar manualmente)

| Ferramenta | Versão esperada | Observação |
|---|---|---|
| Node.js | **22.x LTS** | Expo 54 requer Node 18+; LTS 22 é recomendado |
| npm | **10.x** (vem com Node 22) | Gerenciador de pacotes |
| Expo CLI | **latest** (`npm install -g expo`) | Ferramenta de linha de comando do Expo |
| Git | qualquer recente | — |

**Para rodar no dispositivo físico:**
| Ferramenta | Versão | Observação |
|---|---|---|
| Expo Go (iOS) | app store — versão compatível com SDK 54 | Testar no iPhone |
| Expo Go (Android) | play store — versão compatível com SDK 54 | Testar no Android |

**Para builds nativas (opcional, não obrigatório para desenvolvimento):**
| Ferramenta | Versão | Observação |
|---|---|---|
| Android Studio | Hedgehog ou superior | SDK Android + emulador |
| Xcode | 15 ou superior | Apenas macOS — para iOS |

### Dependências principais

| Pacote | Versão |
|---|---|
| expo | ~54.0.33 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| @react-navigation/native | ^7.1.28 |
| @react-navigation/native-stack | ^7.12.0 |
| @react-navigation/bottom-tabs | ^7.x |
| expo-location | ~19.0.8 |
| expo-font | ~14.0.11 |
| expo-image | ~3.0.11 |
| expo-status-bar | ~3.0.9 |
| @react-native-async-storage/async-storage | 2.2.0 |
| react-native-screens | ~4.16.0 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-svg | 15.12.1 |
| react-native-svg-transformer | ^1.5.3 |
| react-native-maps | (versão instalada via `expo install`) |
| @expo-google-fonts/league-spartan | ^0.4.2 |

### Dependências de desenvolvimento

| Pacote | Versão |
|---|---|
| typescript | ~5.9.2 |
| eslint | ^9.39.2 |
| prettier | ^3.8.1 |
| @types/react | ~19.1.0 |

---

## Setup do ambiente (do zero)

### 1. Pré-requisitos

**Node.js 22 LTS**
```bash
# Via nvm (recomendado)
nvm install 22
nvm use 22
node -v  # deve exibir v22.x.x

# Ou baixar direto em: https://nodejs.org
```

**Expo CLI**
```bash
npm install -g expo
expo --version  # confirmar instalação
```

### 2. Clonar e instalar dependências

```bash
git clone https://github.com/vicente-hofmeister/Safe-Travels-Mobile.git
cd Safe-Travels-Mobile
npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://<IPv4-da-sua-rede-local>:3000
```

> Use o **IPv4 da sua máquina na rede local** (ex: `192.168.1.10`), não `localhost`.
> O `localhost` não funciona no Expo Go rodando em dispositivo físico.
> Para descobrir o IPv4: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux).

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run start
```

O Expo abrirá um QR code no terminal. Escaneie com o Expo Go no celular (iOS ou Android) para abrir o app.

Ou rode diretamente em um emulador:
```bash
npm run android   # requer Android Studio configurado
npm run ios       # requer Xcode (apenas macOS)
```

### 5. Verificar integração com a API

Certifique-se de que a Safe Travels API está rodando antes de usar o app:
```bash
# No repositório da API:
npm run docker:up
curl http://localhost:3000/health
```

---

## Branches

| Branch | Propósito |
|---|---|
| `main` | Último código estável |
| `map-view` | Branch ativa — navegação por abas + tela de mapa |

---

## Estrutura do projeto

```
App.tsx                        # Entry point — SafeAreaProvider, fontes, NavigationContainer
src/
  app/
    navigation/
      RootNavigator.tsx        # Stack navigator (telas de auth → TabNavigator)
      TabNavigator.tsx         # Bottom tab navigator (Início, Mapa)
    screens/
      LoginScreen.tsx          # Tela inicial — botões Log in / Criar conta
      LoginFormScreen.tsx      # Formulário de login (email + senha)
      RegisterScreen.tsx       # Formulário de cadastro
      HomeScreen.tsx           # Tela Início — exibe coordenadas capturadas
      MapScreen.tsx            # Tela Mapa — Google Maps com marcadores de usuários
      mapStyle.ts              # Estilo customizado do Google Maps (paleta do tema)
    components/
      PasswordInput.tsx        # Input de senha com toggle mostrar/ocultar
    services/
      auth/
        authApi.ts             # Chamadas HTTP de autenticação
        authService.ts         # Lógica de login/registro
        authStorage.ts         # Persistência de token/usuário
        index.ts               # Re-exports
      location/
        index.ts               # Re-export do serviço
        locationTrackingService.ts  # Singleton de rastreamento (captura, watch, storage)
        locationApi.ts         # HTTP: POST /location/register, GET /location/latest
        locationStorage.ts     # Persistência local com AsyncStorage
        locationTypes.ts       # Tipos compartilhados de localização
  theme/                       # Design tokens (cores, tipografia, espaçamentos)
assets/
  fonts/                       # Montserrat (variável + itálico)
  images/                      # Logo, ícones
```

---

## Fluxo atual (branch map-view)

1. **LoginScreen** → escolhe entre "Log in" e "Criar conta"
2. **LoginFormScreen** → formulário de login; navega para `Home` via `navigation.reset`
3. **RegisterScreen** → formulário de cadastro; navega para `Home` via `navigation.reset`
4. **TabNavigator** (montado como tela `Home` no stack):
   - **Aba Início** → `HomeScreen` — exibe coordenadas capturadas via `locationTrackingService`
   - **Aba Mapa** → `MapScreen` — Google Maps com marcadores de todos os usuários

---

## Tela de Mapa (`MapScreen`)

- Busca posição própria (`locationTrackingService.captureCurrentPosition()`) e últimas localizações de todos os usuários (`GET /location/latest`) em paralelo com `Promise.all`
- Centraliza o mapa na posição do próprio usuário
- Renderiza um `Marker` por usuário com:
  - **Título:** `name` do usuário
  - **Descrição:** `@username · horário da última captura`
  - **Cor do pin:** `secondary_3` (`#A99942`)
- Usa `PROVIDER_GOOGLE` explicitamente (necessário para `customMapStyle` funcionar)
- Estilo customizado definido em `mapStyle.ts` seguindo a paleta do tema

### Paleta do mapa

| Elemento | Token | Hex |
|---|---|---|
| Fundo base / terreno | `neutral_2` | `#C3C9C9` |
| Ruas (fill) | `neutral_1` | `#EDF1F1` |
| Ruas (stroke) | `neutral_2` | `#C3C9C9` |
| Água | `tertiary_2` | `#87D6D0` |
| Parques | `auxiliary_2` | `#B5C4AB` |
| POI geral | `auxiliary_2` | `#B5C4AB` |
| Pin de localização | `secondary_3` | `#A99942` |

> POI de negócios (restaurantes, postos, etc.) estão ocultos via `visibility: off`.

---

## Integração com a API

### `POST /location/register`
Registra uma localização do usuário.
```json
{
  "userId": "string",
  "latitude": number,
  "longitude": number,
  "accuracyMeters": number | null,
  "capturedAt": "ISO 8601"
}
```

### `GET /location/latest?userIds=id1,id2`
Retorna a localização mais recente de cada usuário (todos, ou filtrado por `userIds`).
```json
{
  "status": "ok",
  "data": [{
    "locationEventId": number,
    "user": { "userId": "string", "username": "string", "name": "string" },
    "latitude": number,
    "longitude": number,
    "accuracyMeters": number | null,
    "capturedAt": "ISO 8601",
    "createdAt": "ISO 8601"
  }]
}
```

> A URL base vem de `EXPO_PUBLIC_API_URL` no `.env`.
> O endpoint `/location/latest` está na branch `map-data-feed` da API (ainda não mergeada em `main`).

---

## Tab bar — cores

| Estado | Ícone | Texto | Fundo |
|---|---|---|---|
| Selecionado | `secondary_3` `#A99942` | `neutral_7` `#191A1A` | `auxiliary_1` `#DBEDD0` |
| Não selecionado | `auxiliary_2` `#B5C4AB` | `auxiliary_3` `#909D88` | — |

---

## Serviço de localização (`LocationTrackingService`)

Singleton exportado como `locationTrackingService`. Principais métodos:

| Método | Descrição |
|---|---|
| `requestPermissions()` | Solicita permissão de localização em foreground |
| `captureCurrentPosition()` | Captura posição atual (ou última conhecida) e salva localmente |
| `registerCurrentPosition(userId)` | Captura + envia para a API |
| `startTracking(options?)` | Inicia rastreamento contínuo com `watchPositionAsync` |
| `stopTracking()` | Para o rastreamento |
| `getStoredLocations()` | Retorna pontos salvos no AsyncStorage |
| `clearStoredLocations()` | Limpa o storage local |

**Opções de rastreamento padrão:** Accuracy `Balanced` · Distância `10m` · Tempo `10s` · Max `500` pontos

---

## Comandos essenciais

```bash
npm run start     # Expo — QR code no terminal
npm run android   # Android (requer Android Studio)
npm run ios       # iOS (requer Xcode, apenas macOS)
npm run lint
npm run format
```

---

## Padrões de código

- **Componentes funcionais** com TypeScript
- **Estilos via `StyleSheet.create`** — sem styled-components ou outras libs de estilo
- **Design tokens centralizados** em `src/theme` — usar sempre `theme.colors`, `theme.spacing`, `theme.typography`
- **Fontes** carregadas no `App.tsx` via `useFonts` — família Montserrat (variável)
- **Navegação tipada** — `RootStackParamList` e `TabParamList` definem todas as rotas
- **Instalar novas libs nativas sempre com `expo install`**, não `npm install` — garante versão compatível com o SDK

---

## Observações importantes

- `newArchEnabled: true` no `app.json` — nova arquitetura do React Native habilitada
- `EXPO_PUBLIC_API_URL` **deve** estar configurada no `.env`
- `react-native-maps` requer `PROVIDER_GOOGLE` explícito para `customMapStyle` funcionar no Android
- No iOS, `customMapStyle` só funciona com Google Maps provider (requer API key) — não funciona com Apple Maps (padrão)
- Para builds de produção, adicionar `GOOGLE_MAPS_API_KEY` no `app.json` em `android.config.googleMaps.apiKey`
- Todos os `TextInput` têm `importantForAutofill="no"` para evitar o fundo amarelo do autofill do Android
