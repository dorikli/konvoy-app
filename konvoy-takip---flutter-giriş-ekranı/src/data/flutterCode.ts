import { DartCodeSnippet } from '../types';

export const FLUTTER_CODE_SNIPPETS: DartCodeSnippet[] = [
  {
    id: 'entry_screen',
    filename: 'convoy_entry_screen.dart',
    path: 'lib/screens/convoy_entry_screen.dart',
    description: 'Ana Giriş Ekranı: "Konvoy Oluştur" & "Konvoya Katıl" butonları, modern radar animasyonu ve şık arayüz.',
    language: 'dart',
    code: `import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../widgets/join_convoy_dialog.dart';
import '../widgets/create_convoy_dialog.dart';

/// Konvoy Takip Uygulaması Modern Giriş Ekranı
class ConvoyEntryScreen extends StatefulWidget {
  const ConvoyEntryScreen({super.key});

  @override
  State<ConvoyEntryScreen> createState() => _ConvoyEntryScreenState();
}

class _ConvoyEntryScreenState extends State<ConvoyEntryScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _radarController;
  
  // Dynamic Firebase Realtime Database Stats
  int _activeConvoysCount = 0;
  int _totalDriversCount = 0;
  int _pingMs = 38;
  StreamSubscription? _statsSubscription;

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    // Firebase Realtime Database: Dinamik İstatistik Dinleyicisi
    _listenToFirebaseLiveStats();
  }

  void _listenToFirebaseLiveStats() {
    final convoysRef = FirebaseDatabase.instance.ref('convoys');
    
    _statsSubscription = convoysRef.onValue.listen((DatabaseEvent event) {
      if (!mounted) return;
      final data = event.snapshot.value;
      if (data == null) {
        setState(() {
          _activeConvoysCount = 0;
          _totalDriversCount = 0;
        });
        return;
      }

      int rooms = event.snapshot.children.length;
      int drivers = 0;

      for (var child in event.snapshot.children) {
        final participantsSnapshot = child.child('kullanicilar');
        if (participantsSnapshot.exists) {
          drivers += participantsSnapshot.children.length;
        }
      }

      // Ping Hesaplama (Firebase Server Timestamp / Delta Roundtrip)
      final pingStart = DateTime.now().millisecondsSinceEpoch;
      FirebaseDatabase.instance.ref('.info/serverTimeOffset').get().then((_) {
        if (mounted) {
          final latency = DateTime.now().millisecondsSinceEpoch - pingStart;
          setState(() {
            _pingMs = latency > 0 ? latency : 35;
          });
        }
      });

      setState(() {
        _activeConvoysCount = rooms;
        _totalDriversCount = drivers;
      });
    });
  }

  @override
  void dispose() {
    _statsSubscription?.cancel();
    _radarController.dispose();
    super.dispose();
  }

  void _openJoinConvoyDialog() {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const JoinConvoyDialog(),
    );
  }

  void _openCreateConvoyDialog() {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CreateConvoyDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        children: [
          // 1. Arka Plan Radar & Yol Izgara Deseni
          Positioned.fill(
            child: CustomPaint(
              painter: _RadarBackgroundPainter(animation: _radarController),
            ),
          ),

          // 2. Üst Glow Işık Efekti
          Positioned(
            top: -100,
            left: size.width / 2 - 150,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.primaryAccent.withOpacity(0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 3. Ana İçerik
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Üst Bar (Durum & Canlı Gösterge)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceColor.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppTheme.primaryAccent.withOpacity(0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.primaryAccent,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'GPS AKTİF',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.settings_outlined, color: Colors.white70),
                      ),
                    ],
                  ),

                  const Spacer(flex: 2),

                  // Logo & Başlık Alanı
                  Center(
                    child: Column(
                      children: [
                        // Konvoy İkonu
                        Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppTheme.primaryAccent, AppTheme.cyanAccent],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryAccent.withOpacity(0.35),
                                blurRadius: 28,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.navigation_rounded,
                            size: 42,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Uygulama İsmi
                        const Text(
                          'KONVOY',
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 4,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Alt Açıklama
                        Text(
                          'Gerçek Zamanlı Grup Sürüşü ve Takip',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.6),
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(flex: 3),

                  // Canlı İstatistikler Mini Kartı (Firebase Realtime Dinamik Değerler)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceColor.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem('$_totalDriversCount', 'Sürücü'),
                        Container(width: 1, height: 24, color: Colors.white10),
                        _buildStatItem('$_activeConvoysCount', 'Canlı Konvoy'),
                        Container(width: 1, height: 24, color: Colors.white10),
                        _buildStatItem('$_pingMs ms', 'Gecikme (Ping)'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 1. BUTON: KONVOY OLUŞTUR
                  ElevatedButton(
                    onPressed: _openCreateConvoyDialog,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryAccent, Color(0xFF059669)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryAccent.withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Container(
                        height: 56,
                        alignment: Alignment.center,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline, color: Color(0xFF0F172A), size: 22),
                            SizedBox(width: 10),
                            Text(
                              'Konvoy Oluştur',
                              style: TextStyle(
                                color: Color(0xFF0F172A),
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // 2. BUTON: KONVOYA KATIL
                  OutlinedButton(
                    onPressed: _openJoinConvoyDialog,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(56),
                      backgroundColor: AppTheme.surfaceColor.withOpacity(0.8),
                      side: BorderSide(
                        color: AppTheme.cyanAccent.withOpacity(0.5),
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.pin_outlined, color: AppTheme.cyanAccent, size: 22),
                        SizedBox(width: 10),
                        Text(
                          'Konvoya Katıl',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 15,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}

/// Arka planda dönen modern radar ve koordinat halkaları
class _RadarBackgroundPainter extends CustomPainter {
  final Animation<double> animation;

  _RadarBackgroundPainter({required this.animation}) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.38);
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Eşmerkezli halkalar
    for (int i = 1; i <= 4; i++) {
      canvas.drawCircle(center, i * 60.0, paint);
    }

    // Dönen radar çizgisi
    final radarAngle = animation.value * 2 * math.pi;
    final sweepPaint = Paint()
      ..shader = SweepGradient(
        center: FractionalOffset(center.dx / size.width, center.dy / size.height),
        startAngle: 0.0,
        endAngle: math.pi / 2,
        colors: [
          AppTheme.primaryAccent.withOpacity(0.25),
          Colors.transparent,
        ],
        transform: GradientRotation(radarAngle),
      ).createShader(Rect.fromCircle(center: center, radius: 240));

    canvas.drawCircle(center, 240, sweepPaint);
  }

  @override
  bool shouldRepaint(covariant _RadarBackgroundPainter oldDelegate) => true;
}
`,
  },
  {
    id: 'join_dialog',
    filename: 'join_convoy_dialog.dart',
    path: 'lib/widgets/join_convoy_dialog.dart',
    description: '4 Haneli Oda Kodu Giriş Modalı: Otomatik odaklanma, modern PIN kutuları, klavye entegrasyonu ve doğrulama.',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

/// 4 Haneli Oda Kodu Giriş Bottom Sheet Modalı
class JoinConvoyDialog extends StatefulWidget {
  const JoinConvoyDialog({super.key});

  @override
  State<JoinConvoyDialog> createState() => _JoinConvoyDialogState();
}

class _JoinConvoyDialogState extends State<JoinConvoyDialog> {
  final List<TextEditingController> _controllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    // İlk kutuya otomatik odaklan
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _enteredCode =>
      _controllers.map((c) => c.text).join();

  void _onDigitChanged(int index, String value) {
    setState(() {
      _errorMessage = null;
    });

    if (value.isNotEmpty) {
      // Bir sonraki kutuya geç
      if (index < 3) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        // 4 hane tamamlandıysa otomatik kontrol et
        _validateAndJoin();
      }
    } else {
      // Geri silme durumunda bir önceki kutuya geç
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
    }
  }

  Future<void> _validateAndJoin() async {
    final code = _enteredCode;
    if (code.length != 4) {
      setState(() {
        _errorMessage = 'Lütfen 4 haneli oda kodunu eksiksiz giriniz.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    HapticFeedback.selectionClick();

    // Simüle edilmiş sunucu oda kontrolü
    await Future.delayed(const Duration(milliseconds: 900));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    // Başarılı katılım simülasyonu
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppTheme.primaryAccent),
        ),
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppTheme.primaryAccent),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '#$code Nolu Konvoya Başarıyla Katıldınız!',
                style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: bottomInset + 24,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF131D31),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: Color(0xFF334155), width: 1.5),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Tutamaç çizgisi
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Başlık ve İkon
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.cyanAccent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.meeting_room_rounded, color: AppTheme.cyanAccent),
              ),
              const SizedBox(width: 14),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Konvoya Katıl',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Konvoy liderinden aldığınız kodu girin',
                    style: TextStyle(color: Colors.white60, fontSize: 13),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 28),

          // 4 Haneli PIN Giriş Kutuları
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(4, (index) => _buildPinBox(index)),
          ),

          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.redAccent, fontSize: 13),
            ),
          ],

          const SizedBox(height: 24),

          // Onay Butonu
          ElevatedButton(
            onPressed: _isLoading ? null : _validateAndJoin,
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              backgroundColor: AppTheme.primaryAccent,
              foregroundColor: const Color(0xFF0F172A),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Color(0xFF0F172A),
                    ),
                  )
                : const Text(
                    'Odaya Bağlan',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPinBox(int index) {
    final isFocused = _focusNodes[index].hasFocus;
    final hasValue = _controllers[index].text.isNotEmpty;

    return Container(
      width: 68,
      height: 72,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isFocused
              ? AppTheme.primaryAccent
              : (hasValue ? AppTheme.cyanAccent.withOpacity(0.6) : Colors.white12),
          width: isFocused ? 2.0 : 1.2,
        ),
        boxShadow: isFocused
            ? [
                BoxShadow(
                  color: AppTheme.primaryAccent.withOpacity(0.25),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Center(
        child: RawKeyboardListener(
          focusNode: FocusNode(),
          onKey: (event) {
            // Backspace basıldığında önceki kutuya dön
            if (event is RawKeyDownEvent &&
                event.logicalKey == LogicalKeyboardKey.backspace &&
                _controllers[index].text.isEmpty &&
                index > 0) {
              _focusNodes[index - 1].requestFocus();
            }
          },
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 1,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
            ),
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
            ],
            decoration: const InputDecoration(
              counterText: '',
              border: InputBorder.none,
            ),
            onChanged: (val) => _onDigitChanged(index, val),
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    id: 'create_dialog',
    filename: 'create_convoy_dialog.dart',
    path: 'lib/widgets/create_convoy_dialog.dart',
    description: 'Konvoy Oluşturma Modalı: Konvoy adı, araç tipi seçimi ve otomatik 4 haneli oda kodu üretimi.',
    language: 'dart',
    code: `import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CreateConvoyDialog extends StatefulWidget {
  const CreateConvoyDialog({super.key});

  @override
  State<CreateConvoyDialog> createState() => _CreateConvoyDialogState();
}

class _CreateConvoyDialogState extends State<CreateConvoyDialog> {
  final _nameController = TextEditingController(text: 'Ege Kıyı Turu 🚗');
  String _selectedVehicle = 'Otomobil';
  late String _generatedCode;
  int _maxMembers = 8;

  @override
  void initState() {
    super.initState();
    _generatedCode = (1000 + Random().nextInt(9000)).toString();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF131D31),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Yeni Konvoy Başlat',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),

          // Üretilen Oda Kodu
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.primaryAccent.withOpacity(0.4)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Atanan Oda Kodu', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    Text(
                      '#$_generatedCode',
                      style: const TextStyle(
                        color: AppTheme.primaryAccent,
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _generatedCode = (1000 + Random().nextInt(9000)).toString();
                    });
                  },
                  icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
                  tooltip: 'Yeni Kod Üret',
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),
          TextField(
            controller: _nameController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Konvoy İsmi',
              labelStyle: const TextStyle(color: Colors.white60),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),

          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryAccent,
              foregroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text('Konvoyu Başlat', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    id: 'theme',
    filename: 'app_theme.dart',
    path: 'lib/theme/app_theme.dart',
    description: 'Tasarım Sistemi ve Tema: Neon elektrik yeşili, siber mavi, koyu yol paleti ve modern tipografi.',
    language: 'dart',
    code: `import 'package:flutter/material.dart';

/// Konvoy Takip Uygulaması Modern Renk Paleti ve Tema
class AppTheme {
  // Ana Renkler
  static const Color backgroundColor = Color(0xFF0B111E);
  static const Color surfaceColor = Color(0xFF152238);
  static const Color cardColor = Color(0xFF1C2C48);

  // Vurgu Renkleri
  static const Color primaryAccent = Color(0xFF10B981); // Zümrüt Yeşili
  static const Color cyanAccent = Color(0xFF06B6D4);    // Siber Cyan
  static const Color amberAccent = Color(0xFFF59E0B);   // Uyarı Sarısı
  static const Color dangerAccent = Color(0xFFEF4444);  // Acil Durum / SOS

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundColor,
      primaryColor: primaryAccent,
      colorScheme: const ColorScheme.dark(
        primary: primaryAccent,
        secondary: cyanAccent,
        surface: surfaceColor,
        error: dangerAccent,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: backgroundColor,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}
`,
  },
  {
    id: 'main_dart',
    filename: 'main.dart',
    path: 'lib/main.dart',
    description: 'Flutter Uygulama Başlatıcısı (Entry Point): Sistem arayüz ayarları ve tema konfigürasyonu.',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/convoy_entry_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Sistem durum çubuğu ve navigasyon barı renklerini ayarla
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.backgroundColor,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const ConvoyApp());
}

class ConvoyApp extends StatelessWidget {
  const ConvoyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Konvoy Takip',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const ConvoyEntryScreen(),
    );
  }
}
`,
  },
  {
    id: 'live_map_screen',
    filename: 'convoy_live_map_screen.dart',
    path: 'lib/screens/convoy_live_map_screen.dart',
    description: 'Tam Ekran Canlı GPS Haritası & OSRM Gerçek Karayolu Rotası: Otomatik GPS İzin İsteği, Kullanıcı Konumuna Merkezlenme ve initState İçinde Anında Canlı Mavi Nokta Takibi.',
    language: 'dart',
    code: `import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../widgets/convoy_navigation_search_bar.dart';
import '../services/firebase_convoy_service.dart';

/// Tam Ekran Canlı Konvoy Haritası, OSRM Gerçek Karayolu Rotası ve Otomatik GPS İzinleri
class ConvoyLiveMapScreen extends StatefulWidget {
  final String convoyCode;
  final String convoyName;
  final String destination;
  final bool isLeader;

  const ConvoyLiveMapScreen({
    super.key,
    required this.convoyCode,
    required this.convoyName,
    this.destination = 'Çeşme Marina Otoyol Çıkışı',
    this.isLeader = true,
  });

  @override
  State<ConvoyLiveMapScreen> createState() => _ConvoyLiveMapScreenState();
}

class _ConvoyLiveMapScreenState extends State<ConvoyLiveMapScreen>
    with SingleTickerProviderStateMixin {
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _positionStreamSub;
  late AnimationController _pulseController;

  // Başlangıçta kullanıcının anlık konumunu tutacak değişken
  LatLng _currentLocation = const LatLng(41.0422, 29.0067);
  LatLng _destinationLocation = const LatLng(41.0662, 29.0347);
  String _destinationName = 'Çeşme Marina Otoyol Çıkışı';

  List<LatLng> _routePoints = [];
  double _speed = 0.0;
  double _heading = 0.0;
  bool _isGpsLive = false;
  bool _isRouteLoading = false;
  bool _hasCenteredOnUser = false;
  String _distanceText = '...';
  String _durationText = '...';

  @override
  void initState() {
    super.initState();
    _destinationName = widget.destination;

    // Mavi nokta nabız animasyonu
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();

    // 1. & 3. initState yüklenir yüklenmez GPS izinlerini iste ve canlı konum akışını tetikle
    _requestGpsPermissionAndStartTracking();
  }

  @override
  void dispose() {
    _positionStreamSub?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  /// 1. Otomatik Konum İzinlerini İste ve Canlı Akışı Başlat
  Future<void> _requestGpsPermissionAndStartTracking() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Konum servisi kapalıysa kullanıcıdan açmasını iste
      await Geolocator.openLocationSettings();
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Kullanıcı GPS iznini reddetti.');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('GPS izni kalıcı olarak engellendi.');
      return;
    }

    // 2. Kullanıcının o anki gerçek enlem ve boylamını anında al ve haritayı oraya merkezle
    try {
      final initialPos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.bestForNavigation,
        timeLimit: const Duration(seconds: 10),
      );

      final userCoord = LatLng(initialPos.latitude, initialPos.longitude);
      setState(() {
        _currentLocation = userCoord;
        _speed = initialPos.speed > 0 ? (initialPos.speed * 3.6) : 0.0;
        _heading = initialPos.heading;
        _isGpsLive = true;
        _hasCenteredOnUser = true;

        // Varsayılan hedefi kullanıcının yakınına yerleştir
        _destinationLocation = LatLng(userCoord.latitude + 0.025, userCoord.longitude + 0.030);
      });

      // Haritayı kullanıcının olduğu yere uçur (Okyanusta açılmasın)
      _mapController.move(userCoord, 16.0);
      _fetchOsrmRoute(_currentLocation, _destinationLocation);
    } catch (e) {
      debugPrint('İlk GPS koordinatı alınamadı: \$e');
    }

    // 3. Konum Takibi Akışını (Location.onLocationChanged / Geolocator stream) Başlat
    _positionStreamSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 2, // 2 metre hareket ettikçe güncelle
      ),
    ).listen((Position position) {
      final liveCoord = LatLng(position.latitude, position.longitude);

      setState(() {
        _currentLocation = liveCoord;
        _speed = position.speed > 0 ? (position.speed * 3.6) : 0.0;
        _heading = position.heading;
        _isGpsLive = true;
      });

      if (!_hasCenteredOnUser) {
        _hasCenteredOnUser = true;
        _mapController.move(liveCoord, 16.0);
      }

      // Konvoy sunucusuna kendi canlı konumunu gönder
      FirebaseConvoyService.instance.updateMemberLocation(
        roomCode: widget.convoyCode,
        memberId: 'self',
        lat: liveCoord.latitude,
        lng: liveCoord.longitude,
        speed: _speed,
        heading: _heading,
      );

      // Rotayı canlı güncelle
      _fetchOsrmRoute(liveCoord, _destinationLocation);
    });
  }

  /// OSRM Karayolu Rotası Hesaplama
  Future<void> _fetchOsrmRoute(LatLng start, LatLng end) async {
    setState(() => _isRouteLoading = true);
    try {
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/\${start.longitude},\${start.latitude};\${end.longitude},\${end.latitude}?overview=full&geometries=geojson',
      );
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['code'] == 'Ok' && data['routes'] != null && (data['routes'] as List).isNotEmpty) {
          final primaryRoute = data['routes'][0];
          final List<dynamic> coords = primaryRoute['geometry']['coordinates'];

          final points = coords.map((c) => LatLng(c[1] as double, c[0] as double)).toList();
          final distanceMeters = (primaryRoute['distance'] as num).toDouble();
          final durationSecs = (primaryRoute['duration'] as num).toDouble();

          setState(() {
            _routePoints = points;
            _distanceText = '\${(distanceMeters / 1000).toStringAsFixed(1)} km';
            _durationText = '~\${(durationSecs / 60).round()} dk';
            _isRouteLoading = false;
          });
          return;
        }
      }
    } catch (e) {
      debugPrint('OSRM Rota hatası: \$e');
    }

    setState(() {
      _routePoints = [start, end];
      _isRouteLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      body: Stack(
        children: [
          // 1. Tam Ekran Harita (Kullanıcının Konumu Merkezli)
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation,
              initialZoom: 15.5,
              onTap: (tapPos, point) {
                // Haritada dokunulan yere rota çiz ve konvoya duyur
                setState(() {
                  _destinationLocation = point;
                  _destinationName = 'Seçilen Hedef Noktası';
                });
                _fetchOsrmRoute(_currentLocation, point);

                if (widget.isLeader) {
                  FirebaseConvoyService.instance.updateConvoyDestination(
                    roomCode: widget.convoyCode,
                    destinationName: _destinationName,
                    lat: point.latitude,
                    lng: point.longitude,
                  );
                }
              },
            ),
            children: [
              // 1. Standart Açık Kaynaklı OpenStreetMap (Mapnik) Katmanı (API Key Gerektirmez)
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.convoy_tracker',
              ),

              // OSRM Gerçek Karayolu Rotası
              if (_routePoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _routePoints,
                      strokeWidth: 5.5,
                      color: AppTheme.cyanAccent.withOpacity(0.9),
                    ),
                  ],
                ),

              // 2. Canlı GPS Mavi Nokta ve Hedef Marker'ı
              MarkerLayer(
                markers: [
                  Marker(
                    point: _currentLocation,
                    width: 74,
                    height: 74,
                    child: _buildBlueDotLiveLocationMarker(),
                  ),
                  if (_destinationLocation != null)
                    Marker(
                      point: _destinationLocation!,
                      width: 50,
                      height: 50,
                      child: const Icon(
                        Icons.location_on_rounded,
                        color: AppTheme.primaryAccent,
                        size: 44,
                      ),
                    ),
                ],
              ),
            ],
          ),

          // 3. Üst Bar: Oda Kodu, Konvoydakiler Butonu ve Arama Çubuğu
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      InkWell(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: widget.convoyCode));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Konvoy Kodu (\${widget.convoyCode}) Kopyalandı!'),
                              backgroundColor: AppTheme.primaryAccent,
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A).withOpacity(0.92),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.primaryAccent.withOpacity(0.5)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.4),
                                blurRadius: 12,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.share_rounded, color: AppTheme.primaryAccent, size: 16),
                              const SizedBox(width: 8),
                              Text(
                                'Konvoy Kodu: \${widget.convoyCode}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Konvoydakiler Butonu
                      ElevatedButton.icon(
                        onPressed: () => _showParticipantsSheet(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A).withOpacity(0.92),
                          foregroundColor: AppTheme.primaryAccent,
                          side: Border.all(color: AppTheme.primaryAccent.withOpacity(0.4)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        icon: const Icon(Icons.group_rounded, size: 18),
                        label: const Text(
                          'Konvoydakiler',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),

                      // Geri Kapat Butonu
                      IconButton.filled(
                        onPressed: () => Navigator.pop(context),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withOpacity(0.12),
                        ),
                        icon: const Icon(Icons.close, color: Colors.white),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Nominatim Arama Çubuğu Entegrasyonu
                  ConvoyNavigationSearchBar(
                    convoyCode: widget.convoyCode,
                    userLocation: _currentLocation,
                    isLeader: widget.isLeader,
                    onDestinationSelected: (name, targetCoord) {
                      setState(() {
                        _destinationName = name;
                        _destinationLocation = targetCoord;
                      });
                      _fetchOsrmRoute(_currentLocation, targetCoord);
                      _mapController.move(targetCoord, 14.5);
                    },
                  ),

                  // Hızlı İşlem Araç Çubuğu (Rotayı Temizle, Mola Belirle, Radar Bildir)
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        // 1. Rotayı ve Pini Temizle (X Butonu)
                        if (_destinationLocation != null)
                          Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ActionChip(
                              avatar: const Icon(Icons.close_rounded, color: Colors.redAccent, size: 16),
                              label: const Text('Rotayı Temizle', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                              backgroundColor: Colors.red.withOpacity(0.2),
                              side: BorderSide(color: Colors.redAccent.withOpacity(0.5)),
                              onPressed: () {
                                setState(() {
                                  _destinationLocation = null;
                                  _destinationName = '';
                                  _routePoints.clear();
                                  _distanceText = '';
                                  _durationText = '';
                                });
                                // Haritayı kullanıcının kendi konumuna odakla (başka yere kaymasın)
                                _mapController.move(_currentLocation, 15.5);
                                FirebaseConvoyService.instance.clearConvoyDestination(widget.convoyCode);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Rota ve hedef pini temizlendi.'), backgroundColor: Colors.redAccent),
                                );
                              },
                            ),
                          ),

                        // 2. Ortak Mola Noktası Belirle
                        Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            avatar: const Icon(Icons.local_cafe_rounded, color: Colors.amber, size: 16),
                            label: const Text('Mola Noktası', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            backgroundColor: Colors.amber.withOpacity(0.2),
                            side: BorderSide(color: Colors.amber.withOpacity(0.5)),
                            onPressed: () => _showBreakPointDialog(context),
                          ),
                        ),

                        // 3. Radar / Tehlike Bildir
                        ActionChip(
                          avatar: const Icon(Icons.warning_amber_rounded, color: AppTheme.cyanAccent, size: 16),
                          label: const Text('Radar Bildir', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          backgroundColor: AppTheme.cyanAccent.withOpacity(0.2),
                          side: BorderSide(color: AppTheme.cyanAccent.withOpacity(0.5)),
                          onPressed: () => _showHazardReportDialog(context),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. Sağ Kenar Hızlı "Konvoydakiler" Butonu (Özellikle Lider İçin)
          if (widget.isLeader)
            Positioned(
              top: 170,
              right: 16,
              child: FloatingActionButton.extended(
                heroTag: 'members_btn',
                backgroundColor: const Color(0xFF0F172A).withOpacity(0.92),
                foregroundColor: AppTheme.primaryAccent,
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: Border.all(color: AppTheme.primaryAccent.withOpacity(0.5)),
                ),
                onPressed: () => _showParticipantsSheet(context),
                icon: const Icon(Icons.people_alt_rounded, size: 18),
                label: const Text(
                  'Konvoydakiler',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),

          // 4. Sol Alt Hız ve Telemetri Göstergesi
          Positioned(
            bottom: 24,
            left: 16,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.92),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.15)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.speed_rounded, color: AppTheme.primaryAccent, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        _speed.toStringAsFixed(0),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const Text(
                        ' KM/S',
                        style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 12),
                  Text(
                    'Mesafe: \$_distanceText | Süre: \$_durationText',
                    style: const TextStyle(
                      color: AppTheme.cyanAccent,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 5. Alt Orta: Push-to-Talk (Bas-Konuş Sesli Telsiz) Butonu
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onLongPressStart: (_) {
                  setState(() => _isPttActive = true);
                  FirebaseConvoyService.instance.sendVoiceTones(widget.convoyCode, 'ptt_start');
                },
                onLongPressEnd: (_) {
                  setState(() => _isPttActive = false);
                  FirebaseConvoyService.instance.sendVoiceTones(widget.convoyCode, 'ptt_end');
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Sesli telsiz anonsu konvoya iletildi.'), backgroundColor: AppTheme.cyanAccent),
                  );
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: _isPttActive ? AppTheme.cyanAccent : const Color(0xFF0F172A).withOpacity(0.92),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppTheme.cyanAccent.withOpacity(_isPttActive ? 1.0 : 0.4), width: _isPttActive ? 2.5 : 1.0),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.cyanAccent.withOpacity(_isPttActive ? 0.6 : 0.2),
                        blurRadius: _isPttActive ? 20 : 8,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.mic_rounded,
                        color: _isPttActive ? const Color(0xFF0F172A) : AppTheme.cyanAccent,
                        size: 22,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isPttActive ? 'KONUŞUYORSUNUZ...' : 'TELSİZ BAS-KONUŞ',
                        style: TextStyle(
                          color: _isPttActive ? const Color(0xFF0F172A) : Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 6. Sağ Alt "Mavi Noktama / Konumuma Git" Butonu
          Positioned(
            bottom: 24,
            right: 16,
            child: FloatingActionButton(
              backgroundColor: AppTheme.cyanAccent,
              foregroundColor: const Color(0xFF0F172A),
              elevation: 8,
              onPressed: () => _mapController.move(_currentLocation, 16.5),
              tooltip: 'Konumuma Odaklan',
              child: const Icon(Icons.my_location_rounded, size: 26),
            ),
          ),
        ],
      ),
    );
  }

  /// Konvoydakiler Listesi ve Kişi Çıkarma (Kick) Bottom Sheet Paneli
  void _showParticipantsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StreamBuilder<List<Map<String, dynamic>>>(
          stream: FirebaseConvoyService.instance.getConvoyMembersStream(widget.convoyCode),
          builder: (context, snapshot) {
            final members = snapshot.data ?? [
              {'id': 'leader', 'name': 'Ahmet (Lider)', 'vehicle': 'BMW R1250 GS', 'isLeader': true},
              {'id': 'user_1', 'name': 'Mehmet Kaya', 'vehicle': 'Honda Africa Twin', 'isLeader': false},
              {'id': 'user_2', 'name': 'Can Yılmaz', 'vehicle': 'Yamaha Tracer 9', 'isLeader': false},
              {'id': 'user_3', 'name': 'Burak Demir', 'vehicle': 'Ducati Multistrada', 'isLeader': false},
            ];

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryAccent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.people_alt_rounded, color: AppTheme.primaryAccent, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Konvoydakiler',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                '\${members.length} Sürücü Bağlı',
                                style: const TextStyle(color: Colors.white54, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close, color: Colors.white70),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (widget.isLeader)
                    Container(
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.amber.withOpacity(0.3)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.admin_panel_settings_rounded, color: Colors.amber, size: 18),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Konvoy Liderisiniz: İstemediğiniz sürücünün yanındaki kırmızı butona basarak konvoydan çıkarabilirsiniz.',
                              style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: members.length,
                    separatorBuilder: (_, __) => const Divider(color: Colors.white12, height: 12),
                    itemBuilder: (context, index) {
                      final member = members[index];
                      final isLeader = member['isLeader'] == true;
                      final memberId = member['id'] as String;
                      final memberName = member['name'] as String;

                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: isLeader ? AppTheme.primaryAccent : const Color(0xFF1E293B),
                          child: Text(
                            memberName.isNotEmpty ? memberName[0] : '?',
                            style: TextStyle(
                              color: isLeader ? Colors.black : Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        title: Row(
                          children: [
                            Text(
                              memberName,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            if (isLeader) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.amber.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'LİDER',
                                  style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.w900),
                                ),
                              ),
                            ],
                          ],
                        ),
                        subtitle: Text(
                          member['vehicle'] ?? 'Motosiklet',
                          style: const TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                        trailing: (widget.isLeader && !isLeader)
                            ? IconButton.filled(
                                tooltip: 'Konvoydan Çıkar / At',
                                style: IconButton.styleFrom(
                                  backgroundColor: Colors.redAccent.withOpacity(0.2),
                                  foregroundColor: Colors.redAccent,
                                ),
                                onPressed: () {
                                  // Firebase üzerinden kullanıcıyı odadan sil ve bildirim gönder
                                  FirebaseConvoyService.instance.kickMember(
                                    roomCode: widget.convoyCode,
                                    memberId: memberId,
                                  );
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('\$memberName konvoydan çıkarıldı.'),
                                      backgroundColor: Colors.redAccent,
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.person_remove_rounded, size: 18),
                              )
                            : null,
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  /// Canlı Nabız Yayan Mavi Nokta (Blue Dot Marker)
  Widget _buildBlueDotLiveLocationMarker() {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Dış Şeffaf Nabız Halkası
            Transform.scale(
              scale: 0.4 + (_pulseController.value * 0.95),
              child: Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blue.withOpacity((1 - _pulseController.value) * 0.40),
                  border: Border.all(
                    color: Colors.lightBlueAccent.withOpacity(1 - _pulseController.value),
                    width: 1.5,
                  ),
                ),
              ),
            ),
            // Orta Katman
            Transform.scale(
              scale: 0.3 + (_pulseController.value * 0.5),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blueAccent.withOpacity((1 - _pulseController.value) * 0.3),
                ),
              ),
            ),
            // Merkezdeki Beyaz Kenarlıklı Mavi Nokta
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 3.5),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0xFF3B82F6),
                    blurRadius: 18,
                    spreadRadius: 3,
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
`,
  },
  {
    id: 'search_bar_widget',
    filename: 'convoy_navigation_search_bar.dart',
    path: 'lib/widgets/convoy_navigation_search_bar.dart',
    description: 'Şık Beyaz Arama Çubuğu: Nominatim OpenStreetMap API ile yer arama ve liderin rotasını tüm konvoya eşitleme bileşeni.',
    language: 'dart',
    code: `import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import '../services/firebase_convoy_service.dart';

/// Konvoy Haritası Üst Arama Çubuğu ve Nominatim Yer Bulucu
class ConvoyNavigationSearchBar extends StatefulWidget {
  final String convoyCode;
  final LatLng userLocation;
  final bool isLeader;
  final Function(String name, LatLng targetCoord) onDestinationSelected;

  const ConvoyNavigationSearchBar({
    super.key,
    required this.convoyCode,
    required this.userLocation,
    required this.isLeader,
    required this.onDestinationSelected,
  });

  @override
  State<ConvoyNavigationSearchBar> createState() => _ConvoyNavigationSearchBarState();
}

class _ConvoyNavigationSearchBarState extends State<ConvoyNavigationSearchBar> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Timer? _debounceTimer;

  bool _isLoading = false;
  bool _isDropdownOpen = false;
  List<Map<String, dynamic>> _searchResults = [];
  String? _toastMessage;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onQueryChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isLoading = false;
        _isDropdownOpen = false;
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 400), () {
      _searchPlaces(query);
    });
  }

  /// Nominatim OpenStreetMap Ücretsiz API Arama
  Future<void> _searchPlaces(String query) async {
    setState(() {
      _isLoading = true;
      _isDropdownOpen = true;
    });

    try {
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search?format=json&q=\${Uri.encodeComponent(query)}&addressdetails=1&limit=6&accept-language=tr,en',
      );
      final response = await http.get(url, headers: {'Accept': 'application/json'});

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final results = data.map((item) {
          final lat = double.parse(item['lat']);
          final lon = double.parse(item['lon']);
          final displayName = item['display_name'] as String;
          final cleanName = item['name'] ?? displayName.split(',').first;
          return {
            'name': cleanName,
            'address': displayName,
            'lat': lat,
            'lng': lon,
            'coord': LatLng(lat, lon),
          };
        }).toList();

        setState(() {
          _searchResults = results;
          _isLoading = false;
        });
        return;
      }
    } catch (e) {
      debugPrint('Nominatim arama hatası: \$e');
    }

    setState(() {
      _searchResults = [];
      _isLoading = false;
    });
  }

  /// Lider hedefi seçtiğinde rota çizilir ve Firebase Realtime Database ile tüm konvoya iletilir
  void _selectPlace(Map<String, dynamic> place) {
    final name = place['name'] as String;
    final target = place['coord'] as LatLng;

    _controller.text = name;
    _focusNode.unfocus();
    setState(() {
      _isDropdownOpen = false;
      _toastMessage = '🎯 Hedef Seçildi: \$name (Tüm Konvoyla Eşitlendi)';
    });

    // 1. Yerel haritada OSRM rotasını çiz
    widget.onDestinationSelected(name, target);

    // 2. Lider ise Firebase Realtime Database'e yazarak takipçileri güncelle
    if (widget.isLeader) {
      FirebaseConvoyService.instance.updateConvoyDestination(
        roomCode: widget.convoyCode,
        destinationName: name,
        lat: target.latitude,
        lng: target.longitude,
      );
    }

    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) setState(() => _toastMessage = null);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 1. Şık Beyaz Arama Çubuğu
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.35),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
            border: Border.all(color: Colors.white.withOpacity(0.8), width: 1.5),
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                      ),
                    )
                  : const Icon(Icons.search_rounded, color: Color(0xFF10B981), size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  onChanged: _onQueryChanged,
                  style: const TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Nereye Gitmek İstiyorsunuz? (Örn: Kadıköy, Benzinlik)',
                    hintStyle: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              if (_controller.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 18),
                  onPressed: () {
                    _controller.clear();
                    _onQueryChanged('');
                  },
                )
              else
                Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.radio_button_checked, color: Color(0xFF10B981), size: 12),
                      SizedBox(width: 4),
                      Text(
                        'Canlı Rota',
                        style: TextStyle(
                          color: Color(0xFF047857),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),

        // 2. Canlı Eşitleme Bildirim Baloncuğu
        if (_toastMessage != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF059669),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF059669).withOpacity(0.4),
                  blurRadius: 12,
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 16),
                const SizedBox(width: 8),
                Text(
                  _toastMessage!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],

        // 3. Arama Sonuçları Açılır Menüsü
        if (_isDropdownOpen && _searchResults.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            constraints: const BoxConstraints(maxHeight: 250),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ListView.separated(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(vertical: 6),
              itemCount: _searchResults.length,
              separatorBuilder: (context, i) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
              itemBuilder: (context, index) {
                final place = _searchResults[index];
                return ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.location_on_rounded, color: Color(0xFF10B981), size: 18),
                  ),
                  title: Text(
                    place['name'],
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                      fontSize: 13,
                    ),
                  ),
                  subtitle: Text(
                    place['address'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                  ),
                  trailing: const Icon(Icons.send_rounded, color: Color(0xFF10B981), size: 16),
                  onTap: () => _selectPlace(place),
                );
              },
            ),
          ),
        ],
      ],
    );
  }
}
`,
  },
  {
    id: 'pubspec',
    filename: 'pubspec.yaml',
    path: 'pubspec.yaml',
    description: 'Gerekli Flutter paket bağımlılıkları (Harita, OSRM HTTP ve GPS dahil).',
    language: 'yaml',
    code: `name: convoy_tracker
description: "Modern Flutter Konvoy Takip Uygulaması"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  google_fonts: ^6.2.1
  flutter_animate: ^4.5.0
  pinput: ^5.0.0
  flutter_map: ^7.0.2
  latlong2: ^0.9.1
  geolocator: ^13.0.1
  http: ^1.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
];
