# CLAUDE.md — Safe Travels Mobile

## Contexto do projeto

TCC de Sistemas de Informação (PUCRS) — Vicente Hofmeister.

Sistema colaborativo para compartilhamento de localização em tempo real durante viagens em grupo, com foco em conectividade limitada, segurança e privacidade.

Repositórios relacionados:
- [Safe-Travels-API](https://github.com/vicente-hofmeister/Safe-Travels-API)
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
| expo-location | ~19.0.8 |
| expo-font | ~14.0.11 |
| expo-image | ~3.0.11 |
| expo-status-bar | ~3.0.9 |
| @react-native-async-storage/async-storage | 2.2.0 |
| react-native-screens | ~4.16.0 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-svg | 15.12.1 |
| react-native-svg-transformer | ^1.5.3 |
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
git checkout basic_auth
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
| `basic_auth` | Branch ativa de desenvolvimento — fluxo de autenticação básica |

> Sempre desenvolva a partir de `basic_auth`. Não altere `main` diretamente.

---

## Estrutura do projeto

```
App.tsx                        # Entry point — carrega fontes e monta NavigationContainer
src/
  app/
    navigation/
      RootNavigator.tsx        # Stack navigator (Login → Home)
    screens/
      LoginScreen.tsx          # Tela de login/registro (atualmente com mock de userId)
      HomeScreen.tsx           # Tela home — exibe coordenadas capturadas
    services/
      location/
        index.ts               # Re-export do serviço
        locationTrackingService.ts  # Classe principal de rastreamento (captura, watch, storage)
        locationApi.ts         # Integração HTTP com a API (POST /location/register)
        locationStorage.ts     # Persistência local com AsyncStorage
        locationTypes.ts       # Tipos compartilhados de localização
  theme/                       # Design tokens (cores, tipografia, espaçamentos)
assets/
  fonts/                       # Montserrat (variável + itálico)
  images/                      # Logo, ícones
```

---

## Fluxo atual (branch basic_auth)

1. **LoginScreen** — ao pressionar "Log in" ou "Register", captura a localização atual e envia para a API via `locationTrackingService.registerCurrentPosition(userId)`
   - Atualmente usa `MOCK_USER_ID = "mock-user-mobile"` — substituir pelo ID real do usuário autenticado quando o fluxo de auth estiver completo
2. **HomeScreen** — exibe as coordenadas (lat/lon) capturadas em tempo real via `locationTrackingService.captureCurrentPosition()`

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

**Opções de rastreamento padrão:**
- Accuracy: `Balanced`
- Distance interval: `10m`
- Time interval: `10s`
- Max stored points: `500`

---

## Integração com a API

O serviço de localização se comunica com a Safe Travels API via `locationApi.ts`:

- **Endpoint:** `POST /location/register`
- **Payload:**
```json
{
  "userId": "string",
  "latitude": number,
  "longitude": number,
  "accuracyMeters": number | null,
  "capturedAt": "ISO 8601"
}
```
- A URL base vem de `EXPO_PUBLIC_API_URL` no `.env`

---

## Comandos essenciais

```bash
# Iniciar Expo (escolhe plataforma no terminal)
npm run start

# Abrir diretamente no Android / iOS / Web
npm run android
npm run ios
npm run web

# Lint / Format
npm run lint
npm run format
```

---

## Padrões de código

- **Componentes funcionais** com TypeScript
- **Estilos via `StyleSheet.create`** — sem styled-components ou outras libs de estilo
- **Design tokens centralizados** em `src/theme` — usar sempre `theme.colors`, `theme.spacing`, `theme.typography`
- **Fontes** carregadas no `App.tsx` via `useFonts` — família Montserrat (variável)
- **Navegação tipada** — `RootStackParamList` define todas as rotas; usar `NativeStackScreenProps` nos componentes de tela

---

## Observações importantes

- O `MOCK_USER_ID` em `LoginScreen.tsx` é temporário — será substituído pelo usuário autenticado quando o fluxo de auth estiver integrado
- As telas de Login e Register ainda não têm campos de formulário reais — são placeholders para o fluxo de autenticação em desenvolvimento
- `newArchEnabled: true` está ativo no `app.json` — a nova arquitetura do React Native está habilitada
- A variável `EXPO_PUBLIC_API_URL` **deve** estar configurada no `.env`, caso contrário o app lança erro ao tentar registrar localização
