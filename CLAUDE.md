# CLAUDE.md — Safe Travels Mobile

## Contexto do projeto

TCC de Sistemas de Informação (PUCRS) — Vicente Hofmeister.

Sistema colaborativo para compartilhamento de localização em tempo real durante viagens em grupo, com foco em conectividade limitada, segurança e privacidade.

Repositórios relacionados:
- [Safe-Travels-API](https://github.com/vicente-hofmeister/Safe-Travels-API) — local em `../Safe-Travels-API`
- [Safe-Travels-Wiki](https://github.com/vicente-hofmeister/Safe-Travels-Wiki)

Protótipo de telas (Figma): https://www.figma.com/design/K1rykzJuxcgNQqC5FVksnZ/TCC

---

## Setup em nova máquina (do zero)

Executar na ordem abaixo. Todos os passos marcados **(uma vez)** não precisam ser repetidos na mesma máquina.

### 1. Node.js 22 LTS **(uma vez)**

```bash
# Via nvm (recomendado)
nvm install 22
nvm use 22
node -v  # deve exibir v22.x.x

# Ou baixar direto em: https://nodejs.org
```

### 2. CLIs globais **(uma vez)**

```bash
npm install -g expo          # Expo CLI
npm install -g eas-cli       # EAS CLI — builds nativos e CI/CD
expo --version
eas --version
```

### 3. Clonar e instalar dependências

```bash
git clone https://github.com/vicente-hofmeister/Safe-Travels-Mobile.git
cd Safe-Travels-Mobile
npm install
```

### 4. Login no Expo **(uma vez por máquina)**

```bash
eas login   # credenciais da conta expo.dev de Vicente
```

### 5. Vincular projeto EAS **(uma vez por projeto)**

Só necessário se `app.json` ainda não tiver `expo.extra.eas.projectId`:

```bash
eas init
```

### 6. Variáveis de ambiente

`npm start` detecta o IPv4 local automaticamente e atualiza o `.env`. Não é necessário configurar manualmente para desenvolvimento local.

Para apontar para a API em produção (Render), edite `.env` manualmente e use `npm run start:remote`:

```env
EXPO_PUBLIC_API_URL=https://safe-travels-api.onrender.com
```

### 7. Firewall (Windows — uma vez por máquina)

Para o Expo Go no celular alcançar a API local sem VPN/tunnel, execute como **Administrador**:

```powershell
.\scripts\setup-firewall.ps1
```

Isso abre as portas 3000 (API) e 8081 (Metro) no firewall do Windows.

---

## Modos de execução

| Modo | Comando | API usada | Background location |
|---|---|---|---|
| **Dev local (Expo Go)** | `npm start` | local (auto IPv4) | ❌ não suportado |
| **Dev remoto (Expo Go)** | `npm run start:remote` | Render (sempre) | ❌ não suportado |
| **Dev Build** | `eas build --profile development --platform android` | local (mesmo Metro do `npm start`) | ✅ |
| **Preview APK** | `eas build --profile preview --platform android` | Render (baked no `eas.json`) | ✅ |
| **CI Preview** | push para `main` (GitHub Actions) | Render (baked no `eas.json`) | ✅ |

> APK dev client sempre conecta ao Metro — usa o mesmo `.env` do `npm start`. Para um APK standalone apontando para o Render, use o perfil `preview`.
>
> Expo Go não suporta `expo-task-manager`. Para testar background tracking, use um APK de dev build ou preview.

---

## CI/CD — GitHub Actions

Dois workflows em `.github/workflows/`:

| Workflow | Trigger | O que faz |
|---|---|---|
| `build-development.yml` | PR aberto para `main` | Build APK dev client (EAS) |
| `build-preview.yml` | Push em `main` | Build APK preview + cria GitHub Release |

**Secret necessário no repositório GitHub** (Settings → Secrets → Actions):

| Secret | Como obter |
|---|---|
| `EXPO_TOKEN` | expo.dev → Account Settings → Access Tokens |

---

## Banco de dados (Neon)

Projeto: `safe-travels` · ID: `summer-hall-08900583` · Região: `us-east-1`

Usuários de seed (para testes):

| username | senha | grupos |
|---|---|---|
| `root` | `rootroot` | Viagem PUCRS 2026 |
| `alice` | `senha123` | Viagem PUCRS 2026 |
| `bob` | `senha123` | Viagem PUCRS 2026, Exploração Porto Alegre |
| `carol` | `senha123` | Viagem PUCRS 2026 |
| `dave` | `senha123` | Exploração Porto Alegre |

> Credenciais de conexão (host, user, password) estão nas variáveis de ambiente do Render. Não commitar no repositório.

---

## API — ambientes

| Ambiente | URL | Como iniciar |
|---|---|---|
| Local (Docker) | `http://<IPv4>:3000` | `npm run docker:up` no repositório da API |
| Produção (Render) | `https://safe-travels-api.onrender.com` | auto-deploy no push para `main` da API |

> Cold start de até 1 min no Render free tier após 15 min de inatividade.

---

## Stack e versões

### Ferramentas do sistema

| Ferramenta | Versão | Observação |
|---|---|---|
| Node.js | **22.x LTS** | Expo 54 requer Node 18+; LTS 22 é recomendado |
| npm | **10.x** | Vem com Node 22 |
| Expo CLI | latest | `npm install -g expo` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Git | qualquer recente | — |

**Para rodar no dispositivo físico:**
| Ferramenta | Versão | Observação |
|---|---|---|
| Expo Go (iOS) | app store — SDK 54 | Apenas dev sem background location |
| Expo Go (Android) | play store — SDK 54 | Apenas dev sem background location |

**Para builds nativas locais (opcional):**
| Ferramenta | Versão | Observação |
|---|---|---|
| Android Studio | Hedgehog ou superior | SDK Android + emulador |
| Xcode | 15 ou superior | Apenas macOS — para iOS |

### Dependências principais

| Pacote | Versão |
|---|---|
| expo | ~54.0.34 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| @react-navigation/native | ^7.1.28 |
| @react-navigation/native-stack | ^7.12.0 |
| @react-navigation/bottom-tabs | ^7.x |
| expo-location | ~19.0.8 |
| expo-task-manager | ~14.0.9 |
| expo-dev-client | ~6.0.21 |
| expo-font | ~14.0.11 |
| expo-image | ~3.0.11 |
| expo-status-bar | ~3.0.9 |
| @react-native-async-storage/async-storage | 2.2.0 |
| react-native-screens | ~4.16.0 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-svg | 15.12.1 |
| react-native-svg-transformer | ^1.5.3 |
| react-native-maps | 1.20.1 |
| @expo-google-fonts/league-spartan | ^0.4.2 |

---

## Branches

| Branch | Propósito |
|---|---|
| `main` | Último código estável — trigger de deploy no Render e CI |
| `background_loc` | Branch ativa — background location tracking + EAS CI/CD + Render/Neon |

---

## Estrutura do projeto

```
App.tsx                        # Entry point — importa backgroundLocationTask antes do React
src/
  app/
    navigation/
      RootNavigator.tsx        # Stack navigator (auth → TabNavigator)
      TabNavigator.tsx         # Bottom tab navigator (Início, Mapa)
    screens/
      LoginScreen.tsx
      LoginFormScreen.tsx
      RegisterScreen.tsx
      HomeScreen.tsx           # Exibe coordenadas capturadas
      MapScreen.tsx            # Google Maps — pins de usuários (dourado) e grupos (azul)
      mapStyle.ts              # Estilo customizado do mapa
    components/
      PasswordInput.tsx
    services/
      auth/
        authApi.ts             # HTTP auth com timeout (AbortController, 10s)
        authService.ts
        authStorage.ts
        index.ts
      location/
        index.ts
        locationTrackingService.ts   # Singleton — foreground e background tracking
        backgroundLocationTask.ts    # defineTask para expo-task-manager (importado no App.tsx)
        locationApi.ts         # POST /location/register, GET /location/latest
        locationStorage.ts
        locationTypes.ts
  theme/                       # Design tokens
assets/
  fonts/
  images/
scripts/
  update-env.js                # Detecta IPv4 local e atualiza .env (chamado por npm start)
  setup-firewall.ps1           # Abre portas 3000 e 8081 no firewall do Windows
  patch-expo-cache.js          # Postinstall — corrige bug de body duplo no cache do Expo CLI
```

---

## Serviço de localização (`LocationTrackingService`)

Singleton exportado como `locationTrackingService`.

| Método | Descrição |
|---|---|
| `requestPermissions()` | Permissão foreground |
| `captureCurrentPosition()` | Captura posição atual e salva localmente |
| `registerCurrentPosition(userId)` | Captura + envia para a API |
| `startTracking(options?)` | Rastreamento contínuo foreground (`watchPositionAsync`) |
| `stopTracking()` | Para foreground tracking |
| `startBackgroundTracking()` | Inicia background tracking via `expo-task-manager` |
| `stopBackgroundTracking()` | Para background tracking |
| `isBackgroundTrackingActive()` | Verifica se background tracking está ativo |
| `getStoredLocations()` | Retorna pontos do AsyncStorage |
| `clearStoredLocations()` | Limpa storage local |

**Background tracking:** Accuracy `Balanced` · Distância `50m` · Tempo `60s` · Foreground service notification ativa no Android.

---

## Tela de Mapa (`MapScreen`)

- Pins dourados (`secondary_3` `#A99942`): localização dos usuários (`GET /location/latest`)
- Pins azuis (`primary` `#4E3FCA`): localização dos grupos (`GET /location/group-latest`)
- Centraliza no usuário logado
- Registra localização na API (`POST /location/register`) ao abrir o mapa

---

## Integração com a API

### `POST /location/register`
```json
{ "userId": "string", "latitude": number, "longitude": number, "accuracyMeters": number | null, "capturedAt": "ISO 8601" }
```

### `GET /location/latest?userIds=id1,id2`
```json
{ "status": "ok", "data": [{ "locationEventId": number, "user": { "userId": "string", "username": "string", "name": "string" }, "latitude": number, "longitude": number, "accuracyMeters": number | null, "capturedAt": "ISO 8601", "createdAt": "ISO 8601" }] }
```

### `GET /location/group-latest?groupIds=id1,id2`
Retorna última localização registrada por grupo.

> URL base: `EXPO_PUBLIC_API_URL` no `.env` (local) ou `eas.json` env (preview/produção).

---

## Tab bar — cores

| Estado | Ícone | Texto | Fundo |
|---|---|---|---|
| Selecionado | `secondary_3` `#A99942` | `neutral_7` `#191A1A` | `auxiliary_1` `#DBEDD0` |
| Não selecionado | `auxiliary_2` `#B5C4AB` | `auxiliary_3` `#909D88` | — |

---

## Comandos essenciais

```bash
npm start                                                 # Expo Go — auto-detecta IPv4 local
npm run start:remote                                      # Expo Go — usa .env como está (Render)
npm run android                                           # Emulador Android (requer Android Studio)
npm run ios                                               # Emulador iOS (requer Xcode)
npm run lint
npm run format

eas build --profile development --platform android        # APK dev client (background location)
eas build --profile preview --platform android            # APK standalone (API produção)
```

---

## Padrões de código

- **Componentes funcionais** com TypeScript
- **Estilos via `StyleSheet.create`** — sem styled-components
- **Design tokens** em `src/theme` — sempre `theme.colors`, `theme.spacing`, `theme.typography`
- **Fontes** carregadas no `App.tsx` via `useFonts` — família Montserrat
- **Navegação tipada** — `RootStackParamList` e `TabParamList`
- **Novas libs nativas sempre com `expo install`**, não `npm install`

---

## Melhorias pendentes

- **Duplicata de localização ao abrir o mapa**: `MapScreen` chama `registerLocation` ao abrir, e o background task pode coincidir — resulta em dois registros com o mesmo `captured_at`. Solução: remover o `registerLocation` do `MapScreen` e deixar apenas o background tracking responsável pelos envios.
- **UI de controle do background tracking**: não há botão para o usuário ligar/desligar o rastreamento em background. Atualmente auto-inicia ao logar e nunca para. Adicionar toggle na HomeScreen ou em uma tela de configurações.

---

## Observações importantes

- `newArchEnabled: true` no `app.json` — nova arquitetura React Native habilitada
- `backgroundLocationTask.ts` deve ser importado no topo de `App.tsx` antes de qualquer render — requisito do `expo-task-manager`
- `react-native-maps` requer `PROVIDER_GOOGLE` explícito para `customMapStyle` funcionar no Android
- `accuracy_meters` é `integer` no banco — usar `Math.round()` antes de enviar para a API
- Para builds de produção, adicionar `GOOGLE_MAPS_API_KEY` no `app.json` → `android.config.googleMaps.apiKey`
- Todos os `TextInput` têm `importantForAutofill="no"` para evitar fundo amarelo do autofill Android
