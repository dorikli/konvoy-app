import React from 'react';
import {
  Terminal,
  FolderGit2,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

export const SetupGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Overview Card - Frosted Glass */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/20 ring-1 ring-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Flutter Konvoy Takip Giriş Ekranı Mimarisi
            </h3>
            <p className="text-xs text-slate-300">
              Modern tasarım ilkeleri, 4 haneli PIN denetleyicisi ve reaktif durum yönetimi
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Uygulama, modern otomotiv ve rota takip sistemlerinden ilham alınarak buzlu cam (Frosted Glass) efektleri
          ve <strong>Elektrik Zümrüdü (Emerald #10B981)</strong> ile <strong>Siber Mavi (Cyan #06B6D4)</strong> vurgularıyla tasarlanmıştır.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10">
            <span className="text-xs font-bold text-emerald-300 block mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 1. Konvoy Oluştur
            </span>
            <p className="text-xs text-slate-300">
              Kullanıcı için rastgele 4 haneli oda PIN'i üretir ve yeni bir konvoy oturumu başlatır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10">
            <span className="text-xs font-bold text-cyan-300 block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 2. Konvoya Katıl
            </span>
            <p className="text-xs text-slate-300">
              4 haneli otomatik odaklanan PIN kutucukları, klavye dinleyicisi ve anlık doğrulama içerir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10">
            <span className="text-xs font-bold text-amber-300 block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 3. Modern Radar
            </span>
            <p className="text-xs text-slate-300">
              <code>CustomPainter</code> ile sürekli dönen radar çizgisi ve konvoy araç dalgaları çizer.
            </p>
          </div>
        </div>
      </div>

      {/* Step by step installation - Frosted Glass Container */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/20 ring-1 ring-white/10 space-y-5">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Flutter Projesine Ekleme Adımları
        </h3>

        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs flex items-center justify-center font-mono font-bold">
              1
            </span>
            <span>Yeni Flutter Projesi Oluşturun veya Mevcut Projenize Geçin:</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl font-mono text-xs text-emerald-300 border border-white/10">
            flutter create convoy_tracker<br />
            cd convoy_tracker
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs flex items-center justify-center font-mono font-bold">
              2
            </span>
            <span>Gerekli Paketleri Ekleyin (Giriş Ekranı + Canlı GPS Haritası):</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl font-mono text-xs text-cyan-300 border border-white/10">
            flutter pub add google_fonts flutter_animate pinput flutter_map latlong2 geolocator
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs flex items-center justify-center font-mono font-bold">
              3
            </span>
            <span>Konum İzinlerini Ekleyin (Android & iOS):</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl font-mono text-xs text-slate-300 border border-white/10 leading-relaxed">
            <p className="text-emerald-400 font-bold mb-1">// android/app/src/main/AndroidManifest.xml</p>
            &lt;uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" /&gt;<br />
            &lt;uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" /&gt;<br /><br />
            <p className="text-cyan-400 font-bold mb-1">// ios/Runner/Info.plist</p>
            &lt;key&gt;NSLocationWhenInUseUsageDescription&lt;/key&gt;<br />
            &lt;string&gt;Konvoy içi anlık konumunuzu ve hızınızı takip etmek için izin gereklidir.&lt;/string&gt;
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs flex items-center justify-center font-mono font-bold">
              4
            </span>
            <span>Dosya Hiyerarşisini Oluşturun:</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl font-mono text-xs text-slate-300 border border-white/10 leading-relaxed">
            lib/<br />
            ├── main.dart<br />
            ├── theme/<br />
            │   └── app_theme.dart<br />
            ├── screens/<br />
            │   ├── convoy_entry_screen.dart<br />
            │   └── convoy_live_map_screen.dart<br />
            └── widgets/<br />
                ├── join_convoy_dialog.dart<br />
                └── create_convoy_dialog.dart
          </div>
        </div>

        {/* Step 5 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs flex items-center justify-center font-mono font-bold">
              5
            </span>
            <span>Uygulamayı Cihazınızda / Emülatörde Başlatın:</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl font-mono text-xs text-emerald-300 border border-white/10">
            flutter run
          </div>
        </div>
      </div>
    </div>
  );
};
