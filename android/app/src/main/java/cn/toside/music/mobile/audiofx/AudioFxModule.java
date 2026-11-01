package cn.toside.music.mobile.audiofx;

import android.media.audiofx.Equalizer;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

/**
 * 基于 android.media.audiofx.Equalizer 的全局音效模块。
 * 使用全局音频会话 (sessionId = 0) 接管系统混音输出，
 * 因此对 TrackPlayer (ExoPlayer) 播放的音频同样生效。
 * 需要在 AndroidManifest 中声明 MODIFY_AUDIO_SETTINGS 权限。
 */
public class AudioFxModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  private Equalizer equalizer;
  // 0 表示全局输出混音
  private static final int GLOBAL_SESSION = 0;

  AudioFxModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "AudioFxModule";
  }

  @ReactMethod
  public void init(Promise promise) {
    try {
      if (equalizer == null) {
        equalizer = new Equalizer(0, GLOBAL_SESSION);
        equalizer.setEnabled(true);
      }

      short numBands = equalizer.getNumberOfBands();
      short[] range = equalizer.getBandLevelRange();
      short minLevel = range[0];
      short maxLevel = range[1];

      WritableArray centerFreqs = Arguments.createArray();
      for (short i = 0; i < numBands; i++) {
        centerFreqs.pushInt(equalizer.getCenterFreq(i));
      }

      WritableArray presets = Arguments.createArray();
      short numPresets = equalizer.getNumberOfPresets();
      for (short i = 0; i < numPresets; i++) {
        presets.pushString(equalizer.getPresetName(i));
      }

      WritableMap bandInfo = Arguments.createMap();
      bandInfo.putInt("numBands", numBands);
      bandInfo.putInt("minLevel", minLevel);
      bandInfo.putInt("maxLevel", maxLevel);
      bandInfo.putArray("centerFreqs", centerFreqs);

      WritableMap result = Arguments.createMap();
      result.putMap("bandInfo", bandInfo);
      result.putArray("presets", presets);

      promise.resolve(result);
    } catch (Exception e) {
      Log.e("AudioFx", "init failed: " + e.getMessage(), e);
      promise.reject("AudioFxInitError", e.getMessage(), e);
    }
  }

  @ReactMethod
  public void setEnabled(boolean enabled, Promise promise) {
    try {
      if (equalizer != null) {
        equalizer.setEnabled(enabled);
      }
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("AudioFxError", e.getMessage(), e);
    }
  }

  @ReactMethod
  public void applyPreset(int preset, Promise promise) {
    try {
      if (equalizer != null) {
        equalizer.usePreset((short) preset);
      }
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("AudioFxError", e.getMessage(), e);
    }
  }

  @ReactMethod
  public void setBandLevel(int band, int level, Promise promise) {
    try {
      if (equalizer != null) {
        equalizer.setBandLevel((short) band, (short) level);
      }
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("AudioFxError", e.getMessage(), e);
    }
  }

  @ReactMethod
  public void release(Promise promise) {
    try {
      if (equalizer != null) {
        equalizer.release();
        equalizer = null;
      }
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("AudioFxError", e.getMessage(), e);
    }
  }
}
